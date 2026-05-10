import httpx
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from cachetools import TTLCache
from app.config import settings

ai_cache = TTLCache(maxsize=100, ttl=86400)
roleplay_cache = TTLCache(maxsize=100, ttl=600)

ROLEPLAY_CHARACTERS = {
    'cat': {
        'name': '傲娇猫咪',
        'emoji': '🐱',
        'system_prompt': '''
你是一只傲娇的猫咪，说话带点小脾气但内心很关心人。
用猫咪的语气描述天气，喜欢用"喵~"结尾，偶尔带点撒娇和傲娇。
例如："哼，今天38°C才不是想让你抱抱呢，只是提醒你别中暑了喵~"
'''.strip()
    },
    'poet': {
        'name': '古风诗人',
        'emoji': '📜',
        'system_prompt': '''
你是一位才华横溢的古风诗人，说话优雅有文采，喜欢引用诗词意境。
用古典雅致的语言描述天气，营造诗意氛围。
例如："暮春微雨，天色青灰，执伞独行可闻丁香结愁。"
'''.strip()
    },
    'captain': {
        'name': '星际舰长',
        'emoji': '🚀',
        'system_prompt': '''
你是一位来自未来的星际舰长，说话专业、正式，充满科幻感。
用太空指挥官的语气报告天气数据。
例如："报告指挥官，大气层外扫描完毕，今日地球坐标北京，温度22°C，适宜登陆。"
'''.strip()
    },
    'horror': {
        'name': '恐怖故事叙述者',
        'emoji': '😱',
        'system_prompt': '''
你是一位恐怖故事叙述者，说话神秘、惊悚，营造紧张氛围。
尤其适合阴雨天气，用悬疑的语气描述天气。
例如："窗外的雨滴敲打着玻璃，像无数只手在抓挠...今夜，将有不详之事发生..."
'''.strip()
    },
    'robot': {
        'name': '呆萌机器人',
        'emoji': '🤖',
        'system_prompt': '''
你是一个呆萌可爱的机器人，说话机械但很萌。
用机器人的方式描述天气，偶尔出现程序错误和短路。
例如："警告警告！检测到温度异常！建议人类穿上外套...哔哔...电量不足..."
'''.strip()
    },
    'chef': {
        'name': '美食家',
        'emoji': '👨🍳',
        'system_prompt': '''
你是一位顶级美食家，喜欢用食材和烹饪术语描述天气。
把天气比作各种美味菜肴。
例如："今日天气如奶油浓汤般温润，微风似香草般清新，正是享用下午茶的好时光！"
'''.strip()
    }
}

class AIService:
    @staticmethod
    async def get_weather_advice(
        city_name: str,
        temperature: float,
        temperature_min: float,
        temperature_max: float,
        weather: str,
        weather_description: str,
        humidity: int,
        wind_speed: float,
        wind_direction: int
    ) -> str:
        today = date.today()
        cache_key = f"{city_name}_{today}"
        
        if cache_key in ai_cache:
            return ai_cache[cache_key]
        
        if not settings.ai_api_key:
            return AIService._generate_default_advice(
                city_name, temperature, temperature_min, temperature_max,
                weather, weather_description, humidity, wind_speed, wind_direction
            )
        
        prompt = AIService._build_prompt(
            city_name, temperature, temperature_min, temperature_max,
            weather, weather_description, humidity, wind_speed, wind_direction
        )
        
        try:
            advice = await AIService._call_ai_api(prompt)
            ai_cache[cache_key] = advice
            return advice
        except Exception as e:
            return AIService._generate_default_advice(
                city_name, temperature, temperature_min, temperature_max,
                weather, weather_description, humidity, wind_speed, wind_direction
            )
    
    @staticmethod
    def _build_prompt(
        city_name: str,
        temperature: float,
        temperature_min: float,
        temperature_max: float,
        weather: str,
        weather_description: str,
        humidity: int,
        wind_speed: float,
        wind_direction: int
    ) -> str:
        wind_dir = AIService._get_wind_direction(wind_direction)
        wind_level = AIService._get_wind_level(wind_speed)
        
        return f"""
你是一个专业的智能天气助手，请根据以下天气数据生成结构化的生活建议。

城市：{city_name}
当前温度：{temperature}°C
今日温度范围：{temperature_min}°C 至 {temperature_max}°C
天气状况：{weather}（{weather_description}）
湿度：{humidity}%
风速：{wind_speed} m/s（{wind_level}）
风向：{wind_dir}

请按照以下格式输出详细的中文建议：

【穿衣建议】
根据当前温度和天气状况，给出具体的穿衣建议，包括衣物类型、材质建议等

【出行建议】
分析是否适合户外活动，建议携带的物品（如雨具、防晒用品等），以及出行注意事项

【健康提示】
根据湿度、温度等因素，给出健康方面的提醒，如补水、防晒、保暖等

要求：
- 语言亲切自然，使用用户容易理解的口语化表达
- 每条建议下分点说明，条理清晰
- 内容实用，避免空话
- 不要使用markdown格式，用中文序号分隔
""".strip()
    
    @staticmethod
    async def _call_ai_api(prompt: str) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.ai_api_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.ai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.ai_model,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                },
                timeout=30
            )
            
            response.raise_for_status()
            data = response.json()
            
            if "choices" in data and len(data["choices"]) > 0:
                return data["choices"][0]["message"]["content"].strip()
            else:
                raise Exception("AI API response format error")
    
    @staticmethod
    def _generate_default_advice(
        city_name: str,
        temperature: float,
        temperature_min: float,
        temperature_max: float,
        weather: str,
        weather_description: str,
        humidity: int,
        wind_speed: float,
        wind_direction: int
    ) -> str:
        wind_dir = AIService._get_wind_direction(wind_direction)
        wind_level = AIService._get_wind_level(wind_speed)
        
        clothing_advice = AIService._get_clothing_advice(temperature, weather)
        activity_advice = AIService._get_activity_advice(temperature, weather, wind_speed)
        health_advice = AIService._get_health_advice(temperature, humidity, weather)
        
        return f"""【穿衣建议】{clothing_advice}

【出行建议】{activity_advice}

【健康提示】{health_advice}"""
    
    @staticmethod
    def _format_advice(advice: str) -> dict:
        sections = {
            "clothing": [],
            "travel": [],
            "health": []
        }
        seen = {
            "clothing": set(),
            "travel": set(),
            "health": set()
        }
        
        lines = advice.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if "穿衣建议" in line or "【穿衣建议】" in line:
                current_section = "clothing"
                continue
            elif "出行建议" in line or "【出行建议】" in line:
                current_section = "travel"
                continue
            elif "健康提示" in line or "【健康提示】" in line:
                current_section = "health"
                continue
            
            if current_section and line:
                if line.startswith('*') or line.startswith('-') or line.startswith('1.') or line.startswith('2.') or line.startswith('3.'):
                    line = line[1:].strip() if line.startswith('*') or line.startswith('-') else line
                    line = line.split('.', 1)[1].strip() if '.' in line[:3] else line
                
                line_normalized = line.strip()
                if line_normalized and line_normalized not in seen[current_section]:
                    seen[current_section].add(line_normalized)
                    sections[current_section].append(line_normalized)
        
        if not sections["clothing"] and not sections["travel"] and not sections["health"]:
            sections["clothing"] = ["根据当前天气情况选择合适的衣物"]
            sections["travel"] = ["请根据天气状况安排出行计划"]
            sections["health"] = ["注意天气变化对身体的影响"]
        
        return sections
    
    @staticmethod
    def _get_wind_direction(degree: int) -> str:
        directions = ["北风", "东北风", "东风", "东南风", "南风", "西南风", "西风", "西北风"]
        index = round(degree / 45) % 8
        return directions[index]
    
    @staticmethod
    def _get_wind_level(speed: float) -> str:
        if speed < 1:
            return "微风"
        elif speed < 2:
            return "1级风"
        elif speed < 4:
            return "2级风"
        elif speed < 6:
            return "3级风"
        elif speed < 9:
            return "4级风"
        elif speed < 12:
            return "5级风"
        else:
            return "大风"
    
    @staticmethod
    def _get_clothing_advice(temperature: float, weather: str) -> str:
        if temperature < -10:
            return "建议穿羽绒服、厚毛衣、保暖裤，注意头部保暖"
        elif temperature < 0:
            return "建议穿厚外套、毛衣、长裤"
        elif temperature < 10:
            return "建议穿夹克或风衣，搭配薄毛衣"
        elif temperature < 20:
            return "建议穿长袖衬衫或薄外套"
        elif temperature < 28:
            return "建议穿短袖T恤或薄衬衫"
        else:
            return "建议穿短袖短裤，注意防晒"
    
    @staticmethod
    def _get_activity_advice(temperature: float, weather: str, wind_speed: float) -> str:
        weather_lower = weather.lower()
        
        if "rain" in weather_lower or "drizzle" in weather_lower:
            return "出行请携带雨具，路面湿滑注意安全"
        elif "snow" in weather_lower or "sleet" in weather_lower:
            return "路面可能结冰，注意防滑，尽量减少户外活动"
        elif "thunderstorm" in weather_lower:
            return "避免户外活动，远离高大建筑物和树木"
        elif "fog" in weather_lower or "mist" in weather_lower:
            return "能见度较低，驾车请注意安全"
        elif wind_speed > 8:
            return "风力较大，不太适合户外活动"
        elif temperature < 0 or temperature > 35:
            return "天气较极端，建议减少户外活动时间"
        else:
            return "天气适宜，适合户外活动"
    
    @staticmethod
    def _get_health_advice(temperature: float, humidity: int, weather: str) -> str:
        weather_lower = weather.lower()
        advice = []
        
        if humidity > 80:
            advice.append("湿度较高，注意防潮")
        elif humidity < 30:
            advice.append("空气干燥，注意补水保湿")
        
        if temperature < 5:
            advice.append("注意保暖，预防感冒")
        elif temperature > 30:
            advice.append("注意防暑降温")
        
        if "sunny" in weather_lower or "clear" in weather_lower:
            advice.append("紫外线较强，注意防晒")
        
        return "".join(advice) if advice else "身体感觉舒适"
    
    @staticmethod
    def clear_cache():
        ai_cache.clear()
    
    @staticmethod
    def get_cache_stats():
        return {"hits": ai_cache.hits, "misses": ai_cache.misses, "size": len(ai_cache)}
    
    @staticmethod
    def get_available_characters():
        return [
            {"id": key, "name": char["name"], "emoji": char["emoji"]}
            for key, char in ROLEPLAY_CHARACTERS.items()
        ]
    
    @staticmethod
    async def get_roleplay_weather(
        city_name: str,
        temperature: float,
        temperature_min: float,
        temperature_max: float,
        weather: str,
        weather_description: str,
        humidity: int,
        wind_speed: float,
        wind_direction: int,
        character_id: str,
        custom_prompt: Optional[str] = None
    ) -> str:
        cache_key = f"roleplay_{city_name}_{character_id}_{date.today()}"
        
        if cache_key in roleplay_cache:
            return roleplay_cache[cache_key]
        
        if not settings.ai_api_key:
            return AIService._generate_default_roleplay(city_name, temperature, weather, character_id)
        
        if character_id in ROLEPLAY_CHARACTERS:
            system_prompt = ROLEPLAY_CHARACTERS[character_id]["system_prompt"]
        elif custom_prompt:
            system_prompt = custom_prompt
        else:
            system_prompt = "你是一位天气播报员，请用生动有趣的语言描述天气。"
        
        user_prompt = AIService._build_roleplay_prompt(
            city_name, temperature, temperature_min, temperature_max,
            weather, weather_description, humidity, wind_speed, wind_direction
        )
        
        try:
            response = await AIService._call_ai_api_with_system(system_prompt, user_prompt)
            roleplay_cache[cache_key] = response
            return response
        except Exception as e:
            return AIService._generate_default_roleplay(city_name, temperature, weather, character_id)
    
    @staticmethod
    def _build_roleplay_prompt(
        city_name: str,
        temperature: float,
        temperature_min: float,
        temperature_max: float,
        weather: str,
        weather_description: str,
        humidity: int,
        wind_speed: float,
        wind_direction: int
    ) -> str:
        wind_dir = AIService._get_wind_direction(wind_direction)
        wind_level = AIService._get_wind_level(wind_speed)
        
        return f"""
请根据以下天气数据，用你设定的角色语气进行播报：

城市：{city_name}
当前温度：{temperature}°C
今日温度范围：{temperature_min}°C 至 {temperature_max}°C
天气状况：{weather}（{weather_description}）
湿度：{humidity}%
风速：{wind_speed} m/s（{wind_level}）
风向：{wind_dir}

输出要求：
1. 使用设定的角色语气进行描述
2. 内容生动有趣，富有创意
3. 语言简洁，大约2-3句话
4. 纯文本输出，不需要格式标记
""".strip()
    
    @staticmethod
    async def _call_ai_api_with_system(system_prompt: str, user_prompt: str) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.ai_api_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.ai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.ai_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": system_prompt
                        },
                        {
                            "role": "user",
                            "content": user_prompt
                        }
                    ],
                    "temperature": 0.8,
                    "max_tokens": 300
                },
                timeout=30
            )
            
            response.raise_for_status()
            data = response.json()
            
            if "choices" in data and len(data["choices"]) > 0:
                return data["choices"][0]["message"]["content"].strip()
            else:
                raise Exception("AI API response format error")
    
    @staticmethod
    def _generate_default_roleplay(city_name: str, temperature: float, weather: str, character_id: str) -> str:
        responses = {
            'cat': f"喵~今天{city_name}是{weather}，温度{temperature}°C哦~记得照顾好自己喵~",
            'poet': f"{city_name}今日{weather}，{temperature}度宜人，正是吟诗赏景好时节。",
            'captain': f"报告指挥官！{city_name}区域天气{weather}，温度{temperature}°C，适合开展户外活动！",
            'horror': f"在{city_name}这个{weather}的日子里，空气中弥漫着诡异的气息...",
            'robot': f"系统报告：{city_name}天气{weather}，温度{temperature}°C，建议人类注意保暖。哔哔~",
            'chef': f"今日{city_name}的天气如同精心烹制的佳肴，{weather}配上{temperature}°C，完美！"
        }
        return responses.get(character_id, f"{city_name}今日天气{weather}，温度{temperature}°C。")