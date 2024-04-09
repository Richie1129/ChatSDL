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
        dispatcher.utter_message(
            text="讓我們來確定一個研究主題，你對以下哪一個領域感興趣。\n"
            "請輸入：物理、化學、地球科學或生物。"
            )
        return []

class ActionSaveScienceDiscipline(Action):
    def name(self):
        return "action_save_science_discipline"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if "化學" in text:
            dispatcher.utter_message(
                text="你對化學感興趣。請問你想探索化學的哪個主題。\n"
                "例如：化學-能量的形式與轉換\n"
                "物質的分離與鑑定\n"
                "物質的結構與功能\n"
                "組成地球的物質\n"
                "水溶液中的變化\n"
                "氧化與還原反應\n"
                "酸鹼反應\n"
                "科學在生活中的應用\n"
                "環境汙染與防治\n"
                "能源的開發與利用\n"
            ) 
            return [SlotSet("science_discipline", "chemistry")]

        elif "物理" in text:
            dispatcher.utter_message(
                text="你對物理感興趣。請問你想探索物理的哪個主題。\n"
                "例如：物理-能量的形式與轉換\n"
                "溫度與熱量\n"
                "力與運動\n"
                "宇宙與天體\n"
                "萬有引力\n"
                "波動、光及聲音\n"
                "電磁現象\n"
                "量子現象\n"
                "物理在生活中的應用-科學、技術及社會的互動關係\n"
                )
            return [SlotSet("science_discipline", "physics")]
        
        elif "生物" in text:
            dispatcher.utter_message(
                text="你對生物感興趣。請問你想探索哪個方向的生物\n"
                "例如：生殖與遺傳\n"
                "演化\n"
                "生物多樣性\n"
                "基因改造\n")
            return [SlotSet("science_discipline", "biology")]
        
        elif "地科" in text or "地球科學" in text:
            dispatcher.utter_message(
                text="你對地球科學感興趣。請問你想探索哪個方向的地球科學。\n"
                "例如：天氣與氣候變化\n"
                "晝夜與季節\n"
                "天然災害與防治。\n"
                "永續發展與資源的利用\n"
                "氣候變遷之影響與調適"
                )
            return [SlotSet("science_discipline", "earth_science")]

        else:
            dispatcher.utter_message(text="不好意思，我沒有理解你的意思。你能說得更具體一點嗎？")
            return []

# 化學
class ActionExploreChemistryTopic(Action):
    def name(self):
        return "action_explore_chemistry_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if "化學-能量的形式與轉換" in text:
            dispatcher.utter_message(
                text="你選擇了能量的形式與轉換。請問你對以下哪個更感興趣。\n"
                     "I. 化學反應中的能量變化\n"
                     "II. 化學反應熱"
            )
            return [SlotSet("subtopic", "energy_transformation")]

        if "物質的分離與鑑定" in text:
            dispatcher.utter_message(
                text="你選擇了物質的分離與鑑定，請問你對以下哪個更感興趣。\n"
                "物質的分離\n"
                "物質的鑑定\n"
                )
            return [SlotSet("subtopic", "substance_separation_identification")]

        if "物質的結構與功能" in text:
            dispatcher.utter_message(
                text="你選擇了物質的結構與功能。請問你對以下哪個更感興趣。\n"
                     "I. 化學式\n"
                     "II. 物質化學式的鑑定\n"
                     "III. 物質的結構\n"
                     "IV. 分子模型介紹"
            )
            return [SlotSet("subtopic", "substance_structure_function")]

        if "組成地球的物質" in text:
            dispatcher.utter_message(
                text="你選擇了組成地球的物質。請問你對以下哪個更感興趣。\n"
                     "I. 自然界中的物質循環\n"
                     "II. 水的性質及影響\n"
                     "III. 水質的淨化、純化與軟化\n"
                     "IV. 海水中蘊藏的資源\n"
                     "V. 空氣中所含的物質"
            )
            return [SlotSet("subtopic", "earth_materials")]

        if "水溶液中的變化" in text:
            dispatcher.utter_message(
                text="你選擇了水溶液中的變化。請問你對以下哪個更感興趣。\n"
                     "I. 水溶液與濃度"
            )
            return [SlotSet("subtopic", "aqueous_solutions")]

        if "氧化與還原" in text:
            dispatcher.utter_message(
                text="你選擇了氧化與還原。請問你對以下哪個更感興趣。\n"
                "氧化反應\n"
                "還原反應"
            )
            return [SlotSet("subtopic", "oxidation_reduction_reactions")]

        if "酸鹼反應" in text:
            dispatcher.utter_message(
                text="你選擇了酸鹼反應，請問你對以下哪個更感興趣\n。"
                "酸鹼中和"
            )
            return [SlotSet("subtopic", "acid_base_reactions")]

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
            return [SlotSet("subtopic", "science_in_life_applications")]

        if "環境汙染與防治" in text:
            dispatcher.utter_message(
                text="你選擇了環境汙染與防治。請問你對以下哪個更感興趣。\n"
                     "I. 水汙染與防治\n"
                     "II. 大氣汙染與防治"
            )
            return [SlotSet("subtopic", "environmental_pollution_control")]

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
            return [SlotSet("subtopic", "energy_development_utilization")]

        return []

# 物理
class ActionExplorePhysicsTopic(Action):
    def name(self):
        return "action_explore_physics_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if "物理-能量的形式與轉換" in text:
            dispatcher.utter_message(
                text="你選擇了能量的形式與轉換。請問你對以下哪個更感興趣。\n"
                     "I. 能量\n"
                     "II. 力學能"
            )
            return [SlotSet("subtopic", "energy_transformation")]

        if "溫度與熱量" in text:
            dispatcher.utter_message(
                text="你選擇了溫度與熱量。請問你對以下哪個更感興趣。\n"
                     "I. 溫度\n"
                     "II. 熱"
            )
            return [SlotSet("subtopic", "temperature_and_heat")]

        if "力與運動" in text:
            dispatcher.utter_message(
                text="你選擇了力與運動。請問你對以下哪個更感興趣。\n"
                     "I. 運動分析\n"
                     "II. 力的作用\n"
                     "III. 摩擦力"
            )
            return [SlotSet("subtopic", "force_and_motion")]

        if "宇宙與天體" in text:
            dispatcher.utter_message(
                text="你選擇了宇宙與天體。請問你對以下哪個更感興趣。\n"
                     "I. 古典物理學發展簡史-宇宙與天體\n"
                     "II. 現代物理的發展-宇宙與天體"
            )
            return [SlotSet("subtopic", "universe_and_celestial")]

        if "萬有引力" in text:
            dispatcher.utter_message(
                text="你選擇了萬有引力。請問你對以下哪個更感興趣。\n"
                "I. 萬有引力的應用"
                )
            return [SlotSet("subtopic", "gravitation")]

        if "波動、光及聲音" in text:
            dispatcher.utter_message(
                text="你選擇了波動、光及聲音。請問你對以下哪個更感興趣。\n"
                     "I. 波的現象\n"
                     "II. 聲音的發生與傳播\n"
                     "III. 聲波的應用\n"
                     "IV. 光的反射及面鏡成像\n"
                     "V. 光的折射及透鏡成像\n"
                     "VI. 光與生活"
            )
            return [SlotSet("subtopic", "waves_light_sound")]

        if "電磁現象" in text:
            dispatcher.utter_message(
                text="你選擇了電磁現象。請問你對以下哪個更感興趣。\n"
                     "I. 靜電與庫侖定律\n"
                     "II. 電流\n"
                     "III. 電流磁效應\n"
                     "IV. 電磁感應現象及應用\n"
                     "V. 電磁波"
            )
            return [SlotSet("subtopic", "electromagnetism")]

        if "量子現象" in text:
            dispatcher.utter_message(
                text="你選擇了量子現象。請問你對以下哪個更感興趣。\n"
                     "I. 現代物理的發展-量子現象\n"
                     "II. 物理在生活中的應用-量子現象"
            )
            return [SlotSet("subtopic", "quantum_phenomena")]

        if "物理在生活中的應用" in text:
            dispatcher.utter_message(
                text="你選擇了物理在生活中的應用。請問你對以下哪個更感興趣。\n"
                "物理在生活中的應用-科學\n"
                "物理在生活中的應用-技術\n"
                "物理在生活中的應用-社會"
                )
            return [SlotSet("subtopic", "physics_in_life_applications")]

        return []

# 生物
class ActionExploreBiologyTopic(Action):
    def name(self):
        return "action_explore_biology_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if "生殖與遺傳" in text:
            dispatcher.utter_message(
                text="你選擇了生殖與遺傳。請問你對以下哪個更感興趣。\n"
                     "I. 遺傳法則\n"
                     "II. 遺傳的分子基礎\n"
                     "III. 突變\n"
                     "IV. 探究活動：DNA 的粗萃取"
            )
            return [SlotSet("subtopic", "reproduction_genetics")]

        if "演化" in text:
            dispatcher.utter_message(
                text="你選擇了演化，請問你對以下哪個更感興趣。\n"
                     "I. 生命的起源\n"
                     "II. 生物的演化"
            )
            return [SlotSet("subtopic", "evolution")]

        if "生物多樣性" in text:
            dispatcher.utter_message(
                text="你選擇了生物多樣性，請問你對以下哪個更感興趣。\n"
                     "I. 校園生物多樣性的觀察"
            )
            return [SlotSet("subtopic", "biodiversity")]

        if "基因改造" in text:
            dispatcher.utter_message(
                text="你選擇了基因改造，請問你對以下哪個更感興趣。\n"
                     "I. 基因改造生物\n"
                     "II. 基因改造食品的安全性"
            )
            return [SlotSet("subtopic", "genetic_modification")]
        return []
# 地科
class ActionExploreEarthScienceTopic(Action):
    def name(self):
        return "action_explore_earth_science_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if "天氣與氣候變化" in text:
            dispatcher.utter_message(
                text="你選擇了天氣與氣候變化。請問你對以下哪個更感興趣。\n"
                     "I. 大氣的變化\n"
                     "II. 天氣的變化"
            )
            return [SlotSet("subtopic", "weather_climate_change")]

        if "晝夜與季節" in text:
            dispatcher.utter_message(
                text="你選擇了晝夜與季節，請問你對以下哪個更感興趣。\n"
                     "I. 晝夜與季節的變化"
            )
            return [SlotSet("subtopic", "day_night_seasons")]

        if "天然災害與防治" in text:
            dispatcher.utter_message(
                text="你選擇了天然災害與防治，請問你對以下哪個更感興趣。\n"
                     "I. 颱風\n"
                     "II. 洪水\n"
                     "III. 地震\n"
                     "IV. 山崩與土石流"
            )
            return [SlotSet("subtopic", "natural_disasters_prevention")]

        if "永續發展與資源的利用" in text:
            dispatcher.utter_message(
                text="你選擇了永續發展與資源的利用，請問你對以下哪個更感興趣。\n"
                     "I. 人與環境互相依存\n"
                     "II. 永續發展的理念"
            )
            return [SlotSet("subtopic", "sustainable_development_resource_use")]

        if "氣候變遷之影響與調適" in text:
            dispatcher.utter_message(
                text="你選擇了氣候變遷之影響與調適，請問你對以下哪個更感興趣。\n"
                     "I. 地球歷史的氣候變遷\n"
                     "II. 短期氣候變化\n"
                     "III. 全球暖化"
            )
            return [SlotSet("subtopic", "climate_change_impacts_adaptation")]
        return []

class ActionSaveSubtopic(Action):
    def name(self):
        return "action_save_subtopic"

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
