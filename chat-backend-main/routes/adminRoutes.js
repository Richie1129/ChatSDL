const router = require('express').Router();
const Message = require('../models/Message');
const Process = require('../models/Process');
const Statistics = require('../models/Statistics');
const Topic = require('../models/Topic');
const { spawn } = require('child_process');
const { exec } = require('child_process');
const execSync = require("child_process").execSync;
const { log } = require('console');
const fs = require('fs');
const path = require('path');
const Chathistory = require('../models/Chathistory');


function runPythonScript(inputData) {
    const pythonScriptPath = path.join(__dirname, '../../python1/model.py');
    const command = `python ${pythonScriptPath} "${JSON.stringify(inputData).replace(/"/g, '\\"')}"`;
    const output = execSync(command);
    return output.toString();
};

// Generate 後 ，跳出SWEETALERT後，儲存mongodb
router.post('/resultsave', async (req, res) => {
    try {
        const { to, user, imagesrc, infresult } = req.body; // 使用req.body取得POST請求中的參數

        const formattedUser = JSON.parse(user); // 不需要使用JSON.parse解析，因為req.body中的參數已經是JSON物件

        console.log("userData為" + formattedUser);
        const { name, email, status, _id, __v } = formattedUser;
        const from = {
            name,
            email,
            status,
            _id,
            __v
        };

        console.log("format :  是" + typeof formattedUser + name + "END");
        console.log("NOW  :" + imagesrc);
        const currentTime = Date.now();

        const newProcess = await Process.create({
            result: infresult,
            from,
            to,
            imageSrc: imagesrc, // 使用小寫的imagesrc參數名稱
            createdAt: currentTime
        });

        console.log("1");

        // 返回成功响应
        res.status(200).json({ message: 'Result saved successfully' });
    } catch (error) {
        // 处理错误情况
        console.error('Error:', error.message);
        res.status(500).json({ error: 'An error occurred' });
    }
});

//NLP MODEL_exec
router.get('/inference', async (req, res) => {
    const { to, user } = req.query;       //接收到的user為 Json string 格式
    console.log(to);
    console.log("user :" + user);
    try {
        const messages = await Message.find({ to }, 'from.name content');
        const inputData = {
            text: messages.reduce((accumulator, message) => {
                return `${accumulator}${message.from.name}: ${message.content} `;
            }, "")
        };
        console.log(inputData);
        const output = runPythonScript(inputData);

        const userData = JSON.parse(user);          // 將user從 Json string 格式 轉為 Json Object

        console.log("userData為" + userData);
        const { name, email, status, _id, __v } = userData;
        const formattedUser = {
            name,
            email,
            status,
            _id,
            __v
        };
        console.log("format :  是" + typeof (formattedUser) + name + "END");


        // 將值存入process table

        // const currentTime = Date.now();

        // const newProcess = await Process.create({
        //     result: output,
        //     from: formattedUser,
        //     to,
        //     createdAt: currentTime
        // });


        // console.log(newProcess);

        // 在這裡處理回傳的結果
        const newStatistics = await Message.aggregate([
            {
                $group: {
                    _id: '$from.name',
                    name: { $first: '$from.name' }, // 保留 from.name 的值
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log(newStatistics);

        // 在這裡處理回傳的結果
        res.send(output);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error running Python script');
    }
});

// 呈現後的結果 ，在 Statistics Component 呈現 。
router.get('/statistics', async (req, res) => {
    const { fromId, to } = req.query;

    try {
        let query = {};
        if (fromId) {
            query = { 'from._id': fromId };
        }

        const matchCondition = {};
        if (to) {
            matchCondition.to = to;
        }

        const messageData = await Message.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$from.name',
                    name: { $first: '$from.name' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const statisticsData = messageData.map(({ _id, name, count }) => ({
            from: { name: name },
            count
        }));

        await Statistics.deleteMany(); // 先清空舊的統計資料
        await Statistics.insertMany(statisticsData); // 插入新的統計資料

        res.json(statisticsData);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error retrieving and saving statistics data');
    }
});

// //visgraph
// router.get('/visgraph', async (req, res) => {
//     const { fromId } = req.query; // 從查詢參數中獲取 'fromId'

//     try {
//         let query = {};
//         if (fromId) {
//             query = { 'from._id': fromId };
//         }

//         const matchCondition = {};
//         if (to) {
//             matchCondition.to = to;
//         }

//         // 查詢特定使用者的所有聊天記錄
//         const chathistoryData = await Chathistory.aggregate([
//             { $match: matchCondition },
//             {
//                 $group: {
//                     _id: '$from.name',
//                     name: { $first: '$from.name' },
//                     content: {from}
//                 }
//             }
//         ]);

//         res.json(chathistoryData); // 返回查詢到的聊天記錄數據
//     } catch (error) {
//         console.error('Error retrieving chat history data:', error);
//         res.status(500).send('Error retrieving chat history data');
//     }
// });

// 呈現 Inference後的結果 ，在 Process Component 呈現 。
router.get('/process', async (req, res) => {
    const { fromId } = req.query;

    try {
        let query = {};

        if (fromId) {
            query = { 'from._id': fromId };
        }

        const processData = await Process.find(query);
        res.json(processData);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error retrieving Process data');
    }
});
// 刪除特定的 Process 資料
router.delete('/process/:processId', async (req, res) => {
    const { processId } = req.params;

    try {
        await Process.findByIdAndRemove(processId);
        res.json({ message: 'Process data deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error deleting Process data');
    }
});

// wordcloud
router.get('/wordCloud', async (req, res) => {
    const { to } = req.query;
    console.log(to);

    try {
        const messages = await Message.find({ to }, 'from.name content');
        const inputData = {
            text: messages.reduce((accumulator, message) => {
                return `${accumulator}${message.from.name}: ${message.content} `;
            }, "")
        };
        console.log(inputData);

        const contents = messages.map(message => message.content);
        console.log(contents)
        console.log(typeof contents)

        // 將收到的訊息轉成文字檔
        fs.writeFileSync(path.join(__dirname, '../../python1/img/data2.txt'), contents.join('\n'));

        // 執行Python腳本，生成文字雲並返回圖片路徑
        const pythonProcess = spawn('python', [path.join(__dirname, '../../python1/wc.py')]);

        pythonProcess.stdout.on('data', data => {
            const imagePath = path.join(data.toString().trim());
            console.log(imagePath)
            console.log('Wordcloud image path:', imagePath);

            // 將圖片轉換為 Base64 字符串
            const base64Image = getImageAsBase64(imagePath);
            // console.log(base64Image);
            console.log("imagePath!!!!" + imagePath);
            // 構建回應物件
            const response = {
                base64Image: base64Image,
                imagePath: imagePath
            };

            // 返回回應物件的 JSON 格式
            res.json(response);
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

// 將圖片轉成base64
function getImageAsBase64(imagePath) {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString('base64');
    return base64Image;
};


router.post('/topics', async (req, res) => {
    const { topicName, roomKey } = req.body;

    try {
        const newTopic = new Topic({ topicName, roomKey });
        await newTopic.save();

        res.status(201).json(newTopic);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error creating topic');
    }
});



module.exports = router