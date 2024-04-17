# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#

# actions.py
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.interfaces import Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import random
import json
import re
from .faq import get_topics  # 確保這個導入正確
 
# topic_check
class ActionTopicResponse(Action):
    def name(self):
        return "action_topic_response"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        # system_persona = (
        #     "你是一名高中科學探究與實作的自然科的老師"
        #     "你的關鍵任務是引導學生發想。"
        #     "利用what、how、why中的兩種即可，進行主題的發想引導學生深入理解主題。"
        #     "回覆中不能有'學生'的字樣，回覆學生的問題不要超過兩個"
        # )
        print("主題確認")
        input_message = tracker.latest_message.get('text')
        topic_entities = [e['value'] for e in tracker.latest_message['entities'] if e['entity'] == 'topic']
        topic_str = ', '.join(topic_entities)
        enriched_input = f"{input_message} (主題: {topic_str})" if topic_entities else input_message

        url = "http://ml.hsueh.tw:1288/query/"
        data = {
            "question": enriched_input
        }
        headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }

        # 發送請求
        response = requests.post(url, json=data, headers=headers)

        responses = []  # 創建一個空陣列來儲存回應

        if response.status_code == 200:
            response_data = response.json()
            responses.append(response_data['response'])  # 將回應加入到陣列中
            # print(response_data['response'])
        else:
            print(f"第一個請求失敗，狀態碼：{response.status_code}")

        # 檢查 responses 是否有內容，如果有則繼續
        if responses:
            # 第二個 API 的 URL 和請求體
            url2 = "http://ml.hsueh.tw/callapi/"
            content = responses[0]  # 取第一個元素作為 content

            data2 = {
            "engine": "taiwan-llama",
            "temperature": 0.7,
            "max_tokens": 300,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [
                {
                "role": "system",
                "content": content
                },{
                "role": "user",
                "content": "你必須使用5W1H框架的問句，給我一個問題，不要包含任何答案。"
                           "回答只能使用繁體中文，回答中不要提供任何答案。"
                }
            ],
            "frequency_penalty": 0,
            "repetition_penalty": 1.03,
            "presence_penalty": 0,
            "stop": "",
            "past_messages": 10,
            "purpose": "dev"
            }

            # 發送第二個請求
            response2 = requests.post(url2, json=data2, headers=headers)

            # 檢查回應狀態碼以確認請求成功
            if response2.status_code == 200:
                chat_response = response2.json()
                if 'choices' in chat_response and len(chat_response['choices']) > 0:
                    content2 = chat_response['choices'][0]['message']['content']
                    dispatcher.utter_message(text=f"首先，你可以先想想這個問題:{content2}")
                    # dispatcher.utter_message(text=content2)
            else:
                print(f"第二個請求失敗，狀態碼：{response2.status_code}")
        else:
            print("沒有回應可用於生成 what、how、why 問題。")

        return []
    
# rag/prompt:摘要並解釋
class ActionRagAbstract(Action):
    def name(self):
        return "action_rag_abstract_explain"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        print("Rag/摘要並名詞解釋")
        input_message = tracker.latest_message.get('text')

        url = "http://ml.hsueh.tw:1288/query/"
        data = {
            "question": input_message
        }
        headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }

        # 發送請求
        response = requests.post(url, json=data, headers=headers)

        responses = []  # 創建一個空陣列來儲存回應

        if response.status_code == 200:
            response_data = response.json()
            responses.append(response_data['response'])  # 將回應加入到陣列中
            # print(response_data['response'])
        else:
            print(f"第一個請求失敗，狀態碼：{response.status_code}")

        # 檢查 responses 是否有內容，如果有則繼續
        if responses:
            # 第二個 API 的 URL 和請求體
            url2 = "http://ml.hsueh.tw/callapi/"
            content = responses[0]  # 取第一個元素作為 content

            data2 = {
            "engine": "taiwan-llama",
            "temperature": 0.7,
            "max_tokens": 500,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [
                {
                "role": "system",
                "content": content
                },{
                "role": "user",
                "content": "請根據內容，利用100字摘要"
                           "回答只能使用繁體中文"
                }
            ],
            "frequency_penalty": 0,
            "repetition_penalty": 1.03,
            "presence_penalty": 0,
            "stop": "",
            "past_messages": 10,
            "purpose": "dev"
            }

            # 發送第二個請求
            response2 = requests.post(url2, json=data2, headers=headers)

            # 檢查回應狀態碼以確認請求成功
            if response2.status_code == 200:
                chat_response = response2.json()
                if 'choices' in chat_response and len(chat_response['choices']) > 0:
                    content2 = chat_response['choices'][0]['message']['content']
                    dispatcher.utter_message(text=f"這邊是提出來的名詞解釋:\n{content2}")
                    # dispatcher.utter_message(text=content2)
            else:
                print(f"第二個請求失敗，狀態碼：{response2.status_code}")
        else:
            print("請問需要什麼幫助呢?")

        return []
    
# Rag/5W1H
class ActionRagQuestion(Action):
    def name(self):
        return "action_rag_5W1H"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        print("Rag/5W1H")
        input_message = tracker.latest_message.get('text')

        url = "http://ml.hsueh.tw:1288/query/"
        data = {"question": input_message}
        headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }

        # 發送請求
        response = requests.post(url, json=data, headers=headers)
        responses = []  # 創建一個空陣列來儲存回應

        if response.status_code == 200:
            response_data = response.json()
            responses.append(response_data['response'])  # 將回應加入到陣列中
            # print(response_data['response'])
        else:
            print(f"第一個請求失敗，狀態碼：{response.status_code}")

        # 檢查 responses 是否有內容，如果有則繼續
        if responses:
            # 第二個 API 的 URL 和請求體
            url2 = "http://ml.hsueh.tw/callapi/"
            content = responses[0]  # 取第一個元素作為 content

            data2 = {
            "engine": "taiwan-llama",
            "temperature": 0.7,
            "max_tokens": 500,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [
                {
                "role": "system",
                "content": content
                },{
                "role": "user",
                "content": "你必須使用5W1H框架的問句，給我一個問題，不要包含任何答案。"
                           "回答只能使用繁體中文，回答中不要提供任何答案。"
                }
            ],
            "frequency_penalty": 0,
            "repetition_penalty": 1.03,
            "presence_penalty": 0,
            "stop": "",
            "past_messages": 10,
            "purpose": "dev"
            }

            # 發送第二個請求
            response2 = requests.post(url2, json=data2, headers=headers)

            # 檢查回應狀態碼以確認請求成功
            if response2.status_code == 200:
                chat_response = response2.json()
                if 'choices' in chat_response and len(chat_response['choices']) > 0:
                    content2 = chat_response['choices'][0]['message']['content']
                    dispatcher.utter_message(text=f"首先，你可以先想想這個問題:\n{content2}")
            else:
                print(f"第二個請求失敗，狀態碼：{response2.status_code}")
        else:
            print("沒有回應可用於生成 what、how、why 問題。")

        return []

# idea_check
class ActionIdeaResponse(Action):
    def name(self):
        return "action_idea_response"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        system_persona = (
            "你是一名高中科學探究與實作的自然科的老師，你的關鍵任務是引導學生發想"
            "當學生提出想法後，利用what、how、why的方法進行想法的發想引導，從而持續引導學生深入了解現象。"
            "回覆的內容最多不能超過300字。回覆的內容必須是繁體中文。"
        )
        print("確認想法")
        input_message = tracker.latest_message.get('text')
        idea_entities = [e['value'] for e in tracker.latest_message['entities'] if e['entity'] == 'idea']
        idea_str = ', '.join(idea_entities)
        enriched_input = f"{input_message} (想法: {idea_str})" if idea_entities else input_message
        url = "http://ml.hsueh.tw/callapi/"
        data = {
            "engine": "taiwan-llama",
            "temperature": 0.7,
            "max_tokens": 300,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [{"role": "system", "content": system_persona},{"role": "user", "content": enriched_input}],
            "frequency_penalty": 0,
            "repetition_penalty": 1.03,
            "presence_penalty": 0,
            "stop": "",
            "past_messages": 10,
            "purpose": "dev"
        }
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
            dispatcher.utter_message(text=message_content)
        except requests.RequestException as error:
            print(f'API請求錯誤: {error}')
            dispatcher.utter_message(text="API請求過程中發生錯誤")

# 判斷問題好壞
# class ActionEvaluateScienceFairQuestion(Action):
#     def name(self):
#         return "action_evaluate_science_fair_question"

#     def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
#         print("判斷研究問題好壞")

#         # 獲取最新的用戶意圖
#         latest_intent = tracker.get_intent_of_latest_message()

#         # 嘗試獲取實體信息
#         entities = tracker.latest_message.get('entities', [])
#         research_question = next((e['value'] for e in entities if e['entity'] == 'research_question'), None)

#         # 根據意圖和實體給出反饋
#         if latest_intent == 'bad_science_fair_question':
#             dispatcher.utter_message(response="utter_bad_question_detected")
#         elif latest_intent == 'good_science_fair_question' and research_question:
#             # 呼叫外部API評估研究問題
#             self.evaluate_question(research_question, dispatcher)
#         elif research_question:
#             # 如果有提取到研究主題的實體，但意圖不明確，也進行評估
#             self.evaluate_question(research_question, dispatcher)
#         else:
#             # 如果意圖不是預期中的，且沒有提取到實體
#             dispatcher.utter_message(text="我不確定你的問題是好是壞，能再詳細一點嗎？")

#         return []

#     def evaluate_question(self, research_question, dispatcher):
#         input_message = research_question
#         url = "http://ml.hsueh.tw/callapi/"
#         data = {
#             "engine": "taiwan-llama",
#             "temperature": 0.7,
#             "max_tokens": 800,
#             "top_p": 0.95,
#             "top_k": 5,
#             "roles": [{"role": "system", 
#                        "content": 
#                         "作為科學探究與實作的高中自然科學導師，您的任務:幫助學生提出的研究問題檢查以下條件，依據列點回答'是'或'否'，給予結論。"
#                         "1. 題目會不會對高中生太難"
#                         "2. 可否取得會自製相關的研究器材"
#                         "3. 研究材料是否容易取得"
#                         "4. 實驗是否安全"
#                         "5. 是否可以找到測量或紀錄的方法"},
#                       {"role": "user", "content": input_message}],
#             "frequency_penalty": 0,
#             "repetition_penalty": 1.03,
#             "presence_penalty": 0,
#             "stop": "",
#             "past_messages": 10,
#             "purpose": "dev"
#         }
#         headers = {
#             'Accept': 'application/json',
#             'Content-Type': 'application/json'
#         }

#         try:
#             response = requests.post(url, json=data, headers=headers)
#             response.raise_for_status()
#             message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
#             dispatcher.utter_message(text=message_content)
#         except requests.RequestException as error:
#             print(f'API請求錯誤: {error}')
#             dispatcher.utter_message(text="API請求過程中發生錯誤")
   
class ActionFallback(Action):
    def name(self):
        return "action_fallback"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        print("其他")
        input_message = tracker.latest_message.get('text')
        url = "http://ml.hsueh.tw/callapi/"
        data = {
            "engine": "taiwan-llama",
            "temperature": 0.7,
            "max_tokens": 800,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [{"role": "user", "content": input_message}],
            "frequency_penalty": 0,
            "repetition_penalty": 1.03,
            "presence_penalty": 0,
            "stop": "",
            "past_messages": 10,
            "purpose": "dev"
        }
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
            dispatcher.utter_message(text=message_content)
        except requests.RequestException as error:
            print(f'API請求錯誤: {error}')
            dispatcher.utter_message(text="API請求過程中發生錯誤")

        return []
    
# 決策樹
class ActionStartDecisionTree(Action):
    def name(self):
        return "action_start_decision_tree"

    def run(self, dispatcher, tracker, domain):
        print("決策樹/科目")
        dispatcher.utter_message(
            text="首先，讓我們來確定一個研究主題，你對以下哪一個科目感興趣?\n"
            "請輸入：物理、化學、地科或生物。"
            )
        return []

# 科目
class ActionSaveScienceDiscipline(Action):
    def name(self):
        return "action_save_science_discipline"

    def run(self, dispatcher: CollectingDispatcher, tracker, domain):
        print("決策樹/科目/主題")
        text = tracker.latest_message.get('text').strip()

        # 學科和對應的主題列表
        disciplines_topics = {
            '化學': [
                "化學-能量的形式與轉換", "物質的分離與鑑定", "物質的結構與功能",
                "組成地球的物質", "水溶液中的變化", "氧化與還原反應", "酸鹼反應",
                "科學在生活中的應用", "天然災害與防治-化學", "環境汙染與防治",
                "能源的開發與利用"
            ],
            '物理': [
                "物理-能量的形式與轉換", "溫度與熱量", "力與運動", "宇宙與天體",
                "萬有引力", "波動、光及聲音", "電磁現象", "量子現象",
                "物理在生活中的應用-科學、技術及社會的互動關係"
            ],
            '生物': [
                "生殖與遺傳", "演化", "生物多樣性", "基因改造"
            ],
            '地科': [
                "天氣與氣候變化", "晝夜與季節", "天然災害與防治-地科",
                "永續發展與資源的利用", "氣候變遷之影響與調適"
            ]
        }

        # 檢查用戶輸入是否匹配已知學科
        for discipline, topics in disciplines_topics.items():
            if re.fullmatch(discipline, text):
                topics_formatted = '\n'.join([f"{i + 1}. {topic}" for i, topic in enumerate(topics)])
                dispatcher.utter_message(
                    text=f"你對{discipline}這個科目感興趣。請問你想探究{discipline}的哪個主題，選擇下列主題進一步探討：\n{topics_formatted}"
                )
                return [SlotSet("science_discipline", discipline)]

        # 如果沒有匹配到任何學科
        dispatcher.utter_message(text="不好意思，我沒有理解你的意思。你能說得更具體一點嗎？")
        return []

# 化學
class ActionExploreChemistryTopic(Action):
    def name(self):
        return "action_explore_chemistry_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if text == "化學-能量的形式與轉換" :
            dispatcher.utter_message(
                text="你選擇了能量的形式與轉換。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 化學反應中的能量變化\n"
                     "2. 化學反應熱"
            )
            return [SlotSet("subtopic", "chemistry_energy_transformation")]

        if text == "物質的分離與鑑定" :
            dispatcher.utter_message(
                text="你選擇了物質的分離與鑑定，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 物質的分離\n"
                     "2. 物質的鑑定\n"
                )
            return [SlotSet("subtopic", "substance_separation_identification")]

        if text == "物質的結構與功能" :
            dispatcher.utter_message(
                text="你選擇了物質的結構與功能。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 化學式\n"
                     "2. 物質化學式的鑑定\n"
                     "3. 物質的結構\n"
                     "4. 分子模型介紹"
            )
            return [SlotSet("subtopic", "substance_structure_function")]

        if text == "組成地球的物質" :
            dispatcher.utter_message(
                text="你選擇了組成地球的物質。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 自然界中的物質循環\n"
                     "2. 水的性質及影響\n"
                     "3. 水質的淨化、純化與軟化\n"
                     "4. 海水中蘊藏的資源\n"
                     "5. 空氣中所含的物質"
            )
            return [SlotSet("subtopic", "earth_materials")]

        if text == "水溶液中的變化" :
            dispatcher.utter_message(
                text="你選擇了水溶液中的變化。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 水溶液與濃度"
            )
            return [SlotSet("subtopic", "aqueous_solutions")]

        if text == "氧化與還原" :
            dispatcher.utter_message(
                text="你選擇了氧化與還原。請問你對以下哪個主題內容更感興趣。\n"
                "1. 氧化與還原反應的應用\n"
                "2. 氧化與還原反應的機制"
            )
            return [SlotSet("subtopic", "oxidation_reduction_reactions")]

        if text == "酸鹼反應" :
            dispatcher.utter_message(
                text="你選擇了酸鹼反應，請問你對以下哪個主題內容更感興趣\n。"
                "1. 酸鹼反應的速率\n"
                "2. 酸鹼反應的平衡"
            )
            return [SlotSet("subtopic", "acid_base_reactions")]

        if text == "科學在生活中的應用" :
            dispatcher.utter_message(
                text="你選擇了科學在生活中的應用。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 食品與化學\n"
                     "2. 衣料與高分子化學\n"
                     "3. 肥皂與清潔劑\n"
                     "4. 高分子材料與化學：塑膠\n"
                     "5. 陶瓷磚瓦和玻璃\n"
                     "6. 奈米材料、先進材料\n"
                     "7. 藥物與化學"
            )
            return [SlotSet("subtopic", "science_in_life_applications")]
        
        if text == "天然災害與防治-化學" :
            dispatcher.utter_message(
                text="你選擇了天然災害與防治。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 天然災害的影響\n"
                     "2. 化學防治\n"
                     
            )
            return [SlotSet("subtopic", "natural_disasters_and_prevention_chemistry")]

        if text == "環境汙染與防治" :
            dispatcher.utter_message(
                text="你選擇了環境汙染與防治。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 水汙染與防治\n"
                     "2. 大氣汙染與防治"
            )
            return [SlotSet("subtopic", "environmental_pollution_control")]

        if text == "能源的開發與利用" :
            dispatcher.utter_message(
                text="你選擇了能源的開發與利用。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 化石燃料：煤、石油、天然氣\n"
                     "2. 石油分餾及其主要產物\n"
                     "3. 烴的燃燒與汽油辛烷值\n"
                     "4. 化學電池原理\n"
                     "5. 常見的電池\n"
                     "6. 化學電池\n"
                     "7. 替代能源\n"
                     "8. 簡介臺灣的再生能源及附近海域能源的蘊藏與開發"
            )
            return [SlotSet("subtopic", "energy_development_utilization")]

        return []

# 物理
class ActionExplorePhysicsTopic(Action):
    def name(self):
        return "action_explore_physics_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if text == "物理-能量的形式與轉換" :
            dispatcher.utter_message(
                text="你選擇了能量的形式與轉換。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 能量\n"
                     "2. 力學能"
            )
            return [SlotSet("subtopic", "physics_energy_transformation")]

        if text == "溫度與熱量" :
            dispatcher.utter_message(
                text="你選擇了溫度與熱量。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 溫度\n"
                     "2. 熱"
            )
            return [SlotSet("subtopic", "temperature_and_heat")]

        if text == "力與運動" :
            dispatcher.utter_message(
                text="你選擇了力與運動。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 運動分析\n"
                     "2. 力的作用\n"
                     "3. 摩擦力"
            )
            return [SlotSet("subtopic", "force_and_motion")]

        if text == "宇宙與天體" :
            dispatcher.utter_message(
                text="你選擇了宇宙與天體。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 古典物理學發展簡史-宇宙與天體\n"
                     "2. 現代物理的發展-宇宙與天體"
            )
            return [SlotSet("subtopic", "universe_and_celestial")]

        if text == "萬有引力" :
            dispatcher.utter_message(
                text="你選擇了萬有引力。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 萬有引力的應用"
                )
            return [SlotSet("subtopic", "gravitation")]

        if text == "波動、光及聲音" :
            dispatcher.utter_message(
                text="你選擇了波動、光及聲音。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 波的現象\n"
                     "2. 聲音的發生與傳播\n"
                     "3. 聲波的應用\n"
                     "4. 光的反射及面鏡成像\n"
                     "5. 光的折射及透鏡成像\n"
                     "6. 光與生活"
            )
            return [SlotSet("subtopic", "waves_light_sound")]

        if text == "電磁現象" :
            dispatcher.utter_message(
                text="你選擇了電磁現象。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 靜電與庫侖定律\n"
                     "2. 電流\n"
                     "3. 電流磁效應\n"
                     "4. 電磁感應現象及應用\n"
                     "5. 電磁波"
            )
            return [SlotSet("subtopic", "electromagnetism")]

        if text == "量子現象" :
            dispatcher.utter_message(
                text="你選擇了量子現象。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 現代物理的發展-量子現象\n"
                     "2. 物理在生活中的應用-量子現象"
            )
            return [SlotSet("subtopic", "quantum_phenomena")]

        if text == "物理在生活中的應用" :
            dispatcher.utter_message(
                text="你選擇了物理在生活中的應用。請問你對以下哪個主題內容更感興趣。\n"
                "1. 物理在生活中的應用-科學\n"
                "2. 物理在生活中的應用-技術\n"
                "3. 物理在生活中的應用-社會"
                )
            return [SlotSet("subtopic", "physics_in_life_applications")]

        return []

# 生物
class ActionExploreBiologyTopic(Action):
    def name(self):
        return "action_explore_biology_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if text == "生殖與遺傳" :
            dispatcher.utter_message(
                text="你選擇了生殖與遺傳。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 遺傳法則\n"
                     "2. 遺傳的分子基礎\n"
                     "3. 突變\n"
                     "4. 探究活動：DNA 的粗萃取"
            )
            return [SlotSet("subtopic", "reproduction_genetics")]

        if text == "演化" :
            dispatcher.utter_message(
                text="你選擇了演化，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 生命的起源\n"
                     "2. 生物的演化"
            )
            return [SlotSet("subtopic", "evolution")]

        if text == "生物多樣性" :
            dispatcher.utter_message(
                text="你選擇了生物多樣性，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 校園生物多樣性的觀察"
            )
            return [SlotSet("subtopic", "biodiversity")]

        if text == "基因改造" :
            dispatcher.utter_message(
                text="你選擇了基因改造，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 基因改造生物\n"
                     "2. 基因改造食品的安全性"
            )
            return [SlotSet("subtopic", "genetic_modification")]
        return []
# 地科
class ActionExploreEarthScienceTopic(Action):
    
    def name(self):
        return "action_explore_earth_science_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if text == "天氣與氣候變化" :
            dispatcher.utter_message(
                text="你選擇了天氣與氣候變化。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 大氣的變化\n"
                     "2. 天氣的變化\n"
                     "3. 氣候變化農業的影響"
            )
            return [SlotSet("subtopic", "weather_climate_change")]

        if text == "晝夜與季節" :
            dispatcher.utter_message(
                text="你選擇了晝夜與季節，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 晝夜的影響\n"
                     "2. 季節的變化"
            )
            return [SlotSet("subtopic", "day_night_seasons")]

        if text == "天然災害與防治-地科" :
            dispatcher.utter_message(
                text="你選擇了天然災害與防治，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 颱風\n"
                     "2. 洪水\n"
                     "3. 地震\n"
                     "4. 山崩與土石流"
            )
            return [SlotSet("subtopic", "natural_disasters_prevention_earth_science")]

        if text == "永續發展與資源的利用" :
            dispatcher.utter_message(
                text="你選擇了永續發展與資源的利用，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 人與環境互相依存\n"
                     "2. 永續發展的理念"
            )
            return [SlotSet("subtopic", "sustainable_development_resource_use")]

        if text == "氣候變遷之影響與調適" :
            dispatcher.utter_message(
                text="你選擇了氣候變遷之影響與調適，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 地球歷史的氣候變遷\n"
                     "2. 短期氣候變化\n"
                     "3. 全球暖化"
            )
            return [SlotSet("subtopic", "climate_change_impacts_adaptation")]
        return []   

# 科技大觀園
class ActionSaveSubtopic(Action):
    def name(self):
        return "action_save_subtopic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')
        print("科技大觀園")
        # API URL
        api_url = "http://ml.hsueh.tw:1287/query/"
        data = {
            "question": text,
            "search_result": ""
        }
        headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }

        # 發送 POST 請求到 API
        response = requests.post(api_url, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            if result.get("response") and result["response"] not in ['API請求失敗', 'API請求過程中發生錯誤']:
                dispatcher.utter_message(text=result["response"])
                dispatcher.utter_message(text="以下來自科技大觀園的相關資訊...")

                search_contents = []
                for content_str in result.get("search_contents", []):
                    if 'Link: ' in content_str and 'Description: ' in content_str:
                        parts = content_str.split(' Link: ')
                        title = parts[0].replace('Title: ', '')
                        link, description = parts[1].split(' Description: ')
                        content_dict = {
                            "title": title,
                            "link": link,
                            "description": description
                        }
                        search_contents.append(content_dict)

                for content in search_contents:
                    message = f"{content['title']}\n{content['description']}\n{content['link']}"
                    dispatcher.utter_message(text=message)
        else:
            dispatcher.utter_message(text="API請求失敗或發生錯誤")
            print('API請求失敗或發生錯誤')

        return []

# 不知道問題答案
# class ActionFaqAnswering(Action):
#     def name(self):
#         return "action_faq_answering"
    
#     def run(self, dispatcher, tracker, domain):
#         print("faq_answering")
#         # 反轉事件列表以便從最新的開始查找
#         events = reversed(tracker.events)
        
#         messages_mix = []
        
#         # 瀏覽事件並收集訊息
#         for event in events:
#             if event.get("event") == "user" or event.get("event") == "bot":
#                 messages_mix.append(event.get("text"))
            
#             # 停止條件：當收集到足夠的訊息
#             if len(messages_mix) >= 6:  # 收集 3 個用戶訊息和 3 個機器人訊息
#                 break
        
#         # 將消息列表轉換為單一字符串，每條消息之間用空格分隔
#         question_text = " ".join(messages_mix) + " 判斷是否有回答問題嗎，回答'是'或'否'"
        
#         url = "http://ml.hsueh.tw:1288/query/"
#         data = {
#             "question": question_text
#         }
#         headers = {
#             'accept': 'application/json',
#             'Content-Type': 'application/json'
#         }

#         # 發送請求
#         response = requests.post(url, json=data, headers=headers)

#         if response.status_code == 200:
#             response_data = response.json()
#             response_result = response_data['response']
#             # 根據回答是否為'是'來設定 slot
#             slot_value = True if response_result == '是' else False
#             return [SlotSet("student_response_quality", slot_value)]
#         else:
#             dispatcher.utter_message(text="無法從API獲取資訊。")
#             return []

class ActionResetSubtopic(Action):
    def name(self):
        return "action_reset_subtopic"

    async def run(self, dispatcher, tracker, domain):
        # 清除subtopic插槽的值
        return [SlotSet("subtopic", None)]
    
# class ActionIrrelevantTopic(Action):
#     def name(self):
#         return "action_irrelevant_topic"

#     def run(self, dispatcher, tracker, domain):
#         # 獲取最近的意圖名稱和實體
#         intent = tracker.latest_message['intent'].get('name')
#         entities = tracker.latest_message['entities']
#         topic_entity = next((e for e in entities if e['entity'] == 'topic'), None)

#         # 如果主題不在預定的列表中，回應不適合的訊息
#         if topic_entity and topic_entity['value'] not in [
#             "能量的形式與轉換", "溫度與熱量", "力與運動", "宇宙與天體", 
#             "萬有引力", "波動、光及聲音", "電磁現象", "量子現象", 
#             "科學、技術及社會的互動關係", "物理在生活中的應用", "物質的分離與鑑定", 
#             "物質的結構與功能", "組成地球的物質", "水溶液中的變化", 
#             "氧化與還原反應", "酸鹼反應", "科學在生活中的應用", 
#             "天然災害與防治", "環境汙染與防治", "氣候變遷之影響與調適", 
#             "能源的開發與利用"]:
#             dispatcher.utter_message(text="這個主題可能不適合做科學探究。")
#         else:
#             dispatcher.utter_message(text=f"讓我們探討{topic_entity['value']}。")

#         return []
