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
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
 
# topic_check
class ActionTopicResponse(Action):
    def name(self):
        return "action_topic_response"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        system_persona = (
            "你是一名高中科學探究與實作的自然科的老師，你的關鍵任務是引導學生發想。"
            "當學生提出主題後，利用what、how、why的方法進行研究主題的發想引導學生深入理解主題。"
            "回覆的內容最多不能超過300字。回覆的內容必須是繁體中文。"
        )
        print("主題確認")
        input_message = tracker.latest_message.get('text')
        topic_entities = [e['value'] for e in tracker.latest_message['entities'] if e['entity'] == 'topic']
        topic_str = ', '.join(topic_entities)
        enriched_input = f"{input_message} (主題: {topic_str})" if topic_entities else input_message

        url = "http://ml.hsueh.tw/callapi/"
        data = {
            "engine": "wulab",
            "temperature": 0.7,
            "max_tokens": 300,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [{"role": "system", "content": system_persona},{"role": "user", "content": enriched_input} ],
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
            "engine": "wulab",
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

class ActionEvaluateScienceFairQuestion(Action):
    def name(self):
        return "action_evaluate_science_fair_question"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        print("判斷研究問題好壞")

        # 獲取最新的用戶意圖
        latest_intent = tracker.get_intent_of_latest_message()

        # 嘗試獲取實體信息
        entities = tracker.latest_message.get('entities', [])
        research_question = next((e['value'] for e in entities if e['entity'] == 'research_question'), None)

        # 根據意圖和實體給出反饋
        if latest_intent == 'bad_science_fair_question':
            dispatcher.utter_message(response="utter_bad_question_detected")
        elif latest_intent == 'good_science_fair_question' and research_question:
            # 呼叫外部API評估研究問題
            self.evaluate_question(research_question, dispatcher)
        elif research_question:
            # 如果有提取到研究主題的實體，但意圖不明確，也進行評估
            self.evaluate_question(research_question, dispatcher)
        else:
            # 如果意圖不是預期中的，且沒有提取到實體
            dispatcher.utter_message(text="我不確定你的問題是好是壞，能再詳細一點嗎？")

        return []

    def evaluate_question(self, research_question, dispatcher):
        input_message = research_question
        url = "http://ml.hsueh.tw/callapi/"
        data = {
            "engine": "wulab",
            "temperature": 0.7,
            "max_tokens": 800,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [{"role": "system", 
                       "content": 
                        "作為科學探究與實作的高中自然科學導師，您的任務:幫助學生提出的研究問題檢查以下條件，依據列點回答'是'或'否'，給予結論。"
                        "1. 題目會不會對高中生太難"
                        "2. 可否取得會自製相關的研究器材"
                        "3. 研究材料是否容易取得"
                        "4. 實驗是否安全"
                        "5. 是否可以找到測量或紀錄的方法"},
                      {"role": "user", "content": input_message}],
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
   
class ActionFallback(Action):
    def name(self):
        return "action_fallback"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        print("其他")
        input_message = tracker.latest_message.get('text')
        url = "http://ml.hsueh.tw/callapi/"
        data = {
            "engine": "gpt-35-turbo",
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
    
class ActionStartDecisionTree(Action):
    def name(self):
        return "action_start_decision_tree"

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message(text="讓我們來確定一個研究主題，你對以下哪一個領域感興趣。請輸入：物理、化學、地球科學或生物。")
        return []

class ActionSaveScienceDiscipline(Action):
    def name(self):
        return "action_save_science_discipline"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if "化學" in text:
            dispatcher.utter_message(
                text="你對化學感興趣。請問你想探索化學的哪個主題。\n"
                     "例如：能量的形式與轉換\n"
                     "物質的分離與鑑定\n"
                     "物質的結構與功能\n"
                     "組成地球的物質\n"
                     "水溶液中的變化\n"
                     "氧化與還原反應\n"
                     "酸鹼反應\n"
                     "科學在生活中的應用\n"
                     "天然災害與防治\n"
                     "環境汙染與防治\n"
                     "氣候變遷之影響與調適\n"
                     "能源的開發與利用\n"
            )
            
            return [SlotSet("science_discipline", "chemistry")]

        # elif "物理" in text:
        #     dispatcher.utter_message(text="你對物理感興趣。請問你想探索哪個方向的物理，例如能量的形式與轉換、宇宙與天體、電磁現象等。")
        #     return [SlotSet("science_discipline", "physics")]
        
        # elif "生物" in text:
        #     dispatcher.utter_message(text="你對生物感興趣。請問你想探索哪個方向的生物，例如生殖與遺傳、生物多樣性、基因改造食品的安全性等。")
        #     return [SlotSet("science_discipline", "biology")]
        
        # elif "地科" in text or "地球科學" in text:
        #     dispatcher.utter_message(text="你對地球科學感興趣。請問你想探索哪個方向的地球科學，例如地表與地殼的變動、氣候變化、天然災害與防治等。")
        #     return [SlotSet("science_discipline", "earth_science")]

        else:
            dispatcher.utter_message(text="不好意思，我沒有理解你的意思。你能說得更具體一點嗎？")
            return []

class ActionExploreChemistryTopic(Action):
    def name(self):
        return "action_explore_chemistry_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if "能量的形式與轉換" in text:
            dispatcher.utter_message(
                text="你選擇了能量的形式與轉換。請問你對以下哪個更感興趣。\n"
                     "I. 化學反應中的能量變化\n"
                     "II. 化學反應熱"
            )
            return [SlotSet("chemistry_topic", "energy_transformation")]

        if "物質的分離與鑑定" in text:
            dispatcher.utter_message(
                text="你選擇了物質的分離與鑑定")
            return [SlotSet("chemistry_topic", "substance_separation_identification")]

        if "物質的結構與功能" in text:
            dispatcher.utter_message(
                text="你選擇了物質的結構與功能。請問你對以下哪個更感興趣。\n"
                     "I. 化學式\n"
                     "II. 物質化學式的鑑定\n"
                     "III. 物質的結構\n"
                     "IV. 分子模型介紹"
            )
            return [SlotSet("chemistry_topic", "substance_structure_function")]

        if "組成地球的物質" in text:
            dispatcher.utter_message(
                text="你選擇了組成地球的物質。請問你對以下哪個更感興趣。\n"
                     "I. 自然界中的物質循環\n"
                     "II. 水的性質及影響\n"
                     "III. 水質的淨化、純化與軟化\n"
                     "IV. 海水中蘊藏的資源\n"
                     "V. 空氣中所含的物質"
            )
            return [SlotSet("chemistry_topic", "earth_materials")]

        if "水溶液中的變化" in text:
            dispatcher.utter_message(
                text="你選擇了水溶液中的變化。請問你對以下哪個更感興趣。\n"
                     "I. 水溶液與濃度"
            )
            return [SlotSet("chemistry_topic", "aqueous_solutions")]

        if "氧化與還原反應" in text:
            dispatcher.utter_message(
                text="你選擇了氧化與還原反應。"
            )
            return [SlotSet("chemistry_topic", "oxidation_reduction_reactions")]

        if "酸鹼反應" in text:
            dispatcher.utter_message(
                text="你選擇了酸鹼反應。"
            )
            return [SlotSet("chemistry_topic", "acid_base_reactions")]

        if "科學在生活中的應用" in text:
            dispatcher.utter_message(
                text="你選擇了科學在生活中的應用。請問你對以下哪個更感興趣。\n"
                     "I. 食品與化學\n"
                     "II. 衣料與高分子化學\n"
                     "III. 肥皂與清潔劑\n"
                     "IV. 高分子材料與化學：塑膠\n"
                     "V. 實驗：鼻涕蟲\n"
                     "VI. 陶瓷磚瓦和玻璃\n"
                     "VII. 奈米材料、先進材料\n"
                     "VIII. 藥物與化學"
            )
            return [SlotSet("chemistry_topic", "science_in_life_applications")]

        if "天然災害與防治" in text:
            dispatcher.utter_message(
                text="你選擇了天然災害與防治。"
            )
            return [SlotSet("chemistry_topic", "natural_disasters_prevention")]

        if "環境汙染與防治" in text:
            dispatcher.utter_message(
                text="你選擇了環境汙染與防治。請問你對以下哪個更感興趣。\n"
                     "I. 水汙染與防治\n"
                     "II. 大氣汙染與防治"
            )
            return [SlotSet("chemistry_topic", "environmental_pollution_control")]

        if "氣候變遷之影響與調適" in text:
            dispatcher.utter_message(
                text="你選擇了氣候變遷之影響與調適。"
            )
            return [SlotSet("chemistry_topic", "climate_change_impact_adaptation")]

        if "能源的開發與利用" in text:
            dispatcher.utter_message(
                text="你選擇了能源的開發與利用。請問你對以下哪個更感興趣。\n"
                     "I. 化石燃料：煤、石油、天然氣\n"
                     "II. 石油分餾及其主要產物\n"
                     "III. 烴的燃燒與汽油辛烷值\n"
                     "IV. 化學電池原理\n"
                     "V. 常見的電池\n"
                     "VI. 化學電池\n"
                     "VII. 替代能源\n"
                     "VIII. 簡介臺灣的再生能源及附近海域能源的蘊藏與開發"
            )
            return [SlotSet("chemistry_topic", "energy_development_utilization")]

        return []

class ActionSaveChemistrySubtopic(Action):
    def name(self):
        return "action_save_chemistry_subtopic"

    def run(self, dispatcher, tracker, domain):
        subtopic = tracker.latest_message.get('text')

        # API URL
        api_url = "http://ml.hsueh.tw:1287/query/"
        data = {
            "question": subtopic,
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

                for content_str in result.get("search_contents", []):
                    if 'Link: ' in content_str and 'Description: ' in content_str:
                        parts = content_str.split(' Link: ')
                        title = parts[0].replace('Title: ', '')
                        link, description = parts[1].split(' Description: ')
                        message = f"{title}\n{link}\n{description}"
                        dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="API請求失敗或數據解析錯誤")
        else:
            dispatcher.utter_message(text="API請求失敗或發生錯誤")
            print('API請求失敗或發生錯誤')

        return []

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
