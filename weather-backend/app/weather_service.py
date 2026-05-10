import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from cachetools import TTLCache
from app.config import settings
from app.schemas import WeatherOut, WeatherCurrent, WeatherForecastDay

cache = TTLCache(maxsize=100, ttl=600)

CITY_ALIASES = {
    '北京': ['beijing', 'bj'],
    '上海': ['shanghai', 'sh'],
    '广州': ['guangzhou', 'gz'],
    '深圳': ['shenzhen', 'sz'],
    '杭州': ['hangzhou', 'hz'],
    '南京': ['nanjing', 'nj'],
    '成都': ['chengdu', 'cd'],
    '武汉': ['wuhan', 'wh'],
    '重庆': ['chongqing', 'cq'],
    '西安': ['xian', 'xa', "xi'an"],
    '天津': ['tianjin', 'tj'],
    '苏州': ['suzhou', 'sz'],
    '郑州': ['zhengzhou', 'zz'],
    '长沙': ['changsha', 'cs'],
    '青岛': ['qingdao', 'qd'],
    '济南': ['jinan', 'jn'],
    '沈阳': ['shenyang', 'sy'],
    '大连': ['dalian', 'dl'],
    '哈尔滨': ['haerbin', 'harbin'],
    '长春': ['changchun', 'cc'],
    '合肥': ['hefei', 'hf'],
    '福州': ['fuzhou', 'fz'],
    '厦门': ['xiamen', 'xm'],
    '南宁': ['nanning', 'nn'],
    '昆明': ['kunming', 'km'],
    '贵阳': ['guiyang', 'gy'],
    '兰州': ['lanzhou', 'lz'],
    '太原': ['taiyuan', 'ty'],
    '石家庄': ['shijiazhuang', 'sjz'],
    '南昌': ['nanchang', 'nc'],
    '宁波': ['ningbo', 'nb'],
    '无锡': ['wuxi', 'wx'],
    '常州': ['changzhou', 'cz'],
    '南通': ['nantong', 'nt'],
    '佛山': ['foshan', 'fs'],
    '东莞': ['dongguan', 'dg'],
    '中山': ['zhongshan', 'zs'],
    '惠州': ['huizhou', 'hz'],
    '珠海': ['zhuhai', 'zh'],
    '江门': ['jiangmen', 'jm'],
    '汕头': ['shantou', 'st'],
    '湛江': ['zhanjiang', 'zj'],
    '肇庆': ['zhaoqing', 'zq'],
    '揭阳': ['jieyang', 'jy'],
    '清远': ['qingyuan', 'qy'],
    '韶关': ['shaoguan', 'sg'],
    '梅州': ['meizhou', 'mz'],
    '潮州': ['chaozhou', 'cz'],
    '河源': ['heyuan', 'hy'],
    '汕尾': ['shanwei', 'sw'],
    '云浮': ['yunfu', 'yf'],
    '阳江': ['yangjiang', 'yj'],
    '黄山': ['huangshan'],
    'huangshan': ['huangshan city'],
    'huangshan city': ['huangshan'],
    '桂林': ['guilin'],
    '丽江': ['lijiang'],
    '九寨沟': ['jiuzhaigou'],
    '张家界': ['zhangjiajie'],
    '三亚': ['sanya'],
    '海口': ['haikou'],
    '吐鲁番': ['turpan'],
    '喀什': ['kashgar'],
}

PROVINCE_CAPITALS = {
    '新疆': 'Urumqi',
    '新疆维吾尔自治区': 'Urumqi',
    '西藏': 'Lhasa',
    '西藏自治区': 'Lhasa',
    '内蒙古': 'Hohhot',
    '内蒙古自治区': 'Hohhot',
    '宁夏': 'Yinchuan',
    '宁夏回族自治区': 'Yinchuan',
    '广西': 'Nanning',
    '广西壮族自治区': 'Nanning',
    '广东': 'Guangzhou',
    '广东省': 'Guangzhou',
    '山东': 'Jinan',
    '山东省': 'Jinan',
    '江苏': 'Nanjing',
    '江苏省': 'Nanjing',
    '浙江': 'Hangzhou',
    '浙江省': 'Hangzhou',
    '福建': 'Fuzhou',
    '福建省': 'Fuzhou',
    '湖南': 'Changsha',
    '湖南省': 'Changsha',
    '湖北': 'Wuhan',
    '湖北省': 'Wuhan',
    '河南': 'Zhengzhou',
    '河南省': 'Zhengzhou',
    '河北': 'Shijiazhuang',
    '河北省': 'Shijiazhuang',
    '山西': 'Taiyuan',
    '山西省': 'Taiyuan',
    '陕西': "Xi'an",
    '陕西省': "Xi'an",
    '四川': 'Chengdu',
    '四川省': 'Chengdu',
    '云南': 'Kunming',
    '云南省': 'Kunming',
    '贵州': 'Guiyang',
    '贵州省': 'Guiyang',
    '安徽': 'Hefei',
    '安徽省': 'Hefei',
    '江西': 'Nanchang',
    '江西省': 'Nanchang',
    '辽宁': 'Shenyang',
    '辽宁省': 'Shenyang',
    '吉林': 'Changchun',
    '吉林省': 'Changchun',
    '黑龙江': 'Harbin',
    '黑龙江省': 'Harbin',
    '甘肃': 'Lanzhou',
    '甘肃省': 'Lanzhou',
    '青海': 'Xining',
    '青海省': 'Xining',
    '海南': 'Haikou',
    '海南省': 'Haikou',
    '台湾': 'Taipei',
    '北京市': 'Beijing',
    '北京': 'Beijing',
    '上海市': 'Shanghai',
    '上海': 'Shanghai',
    '天津市': 'Tianjin',
    '天津': 'Tianjin',
    '重庆市': 'Chongqing',
    '重庆': 'Chongqing',
}

class WeatherService:
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    @staticmethod
    async def get_weather(city_name: str, units: str = "metric") -> WeatherOut:
        cache_key = f"{city_name.lower()}_{units}"
        
        if cache_key in cache:
            cached_data = cache[cache_key]
            if cached_data is not None:
                return cached_data
        
        search_queries = WeatherService._generate_search_queries(city_name)
        
        async with httpx.AsyncClient() as client:
            params = {
                "appid": settings.openweather_api_key,
                "units": units,
                "lang": "zh_cn"
            }
            
            current_data = None
            forecast_data = None
            last_error = None
            
            for query in search_queries:
                params["q"] = query
                
                try:
                    current_response = await client.get(
                        f"{WeatherService.BASE_URL}/weather",
                        params=params
                    )
                    
                    if current_response.status_code == 200:
                        forecast_response = await client.get(
                            f"{WeatherService.BASE_URL}/forecast",
                            params=params
                        )
                        
                        if forecast_response.status_code == 200:
                            current_data = current_response.json()
                            forecast_data = forecast_response.json()
                            break
                        else:
                            last_error = f"获取预报失败: {forecast_response.status_code}"
                    else:
                        last_error = f"城市 {query} 未找到"
                except Exception as e:
                    last_error = str(e)
            
            if not current_data or not forecast_data:
                cache[cache_key] = None
                if last_error:
                    raise Exception(f"无法获取天气数据: {last_error}")
                else:
                    raise Exception(f"无法获取天气数据，请尝试使用城市名（如：北京、Shanghai）")
            
            weather_out = WeatherService._parse_weather(current_data, forecast_data)
            cache[cache_key] = weather_out
            
            return weather_out
    
    @staticmethod
    def _generate_search_queries(city_name: str) -> List[str]:
        queries = []
        city_name = city_name.strip()
        
        if city_name in PROVINCE_CAPITALS:
            capital = PROVINCE_CAPITALS[city_name]
            queries.append(capital)
            queries.append(f"{capital},CN")
            queries.append(f"{capital},China")
        
        queries.append(city_name)
        queries.append(f"{city_name},CN")
        queries.append(f"{city_name},China")
        
        city_name_lower = city_name.lower()
        city_name_upper = city_name.upper()
        city_name_capitalized = city_name.capitalize()
        
        queries.append(city_name_lower)
        queries.append(f"{city_name_lower},CN")
        queries.append(city_name_upper)
        queries.append(f"{city_name_upper},CN")
        queries.append(city_name_capitalized)
        queries.append(f"{city_name_capitalized},CN")
        
        if city_name_lower in CITY_ALIASES:
            for alias in CITY_ALIASES[city_name_lower]:
                queries.append(alias)
                queries.append(f"{alias},CN")
                queries.append(f"{alias},China")
                queries.append(alias.capitalize())
                queries.append(f"{alias.capitalize()},CN")
        
        return list(dict.fromkeys(queries))
    
    @staticmethod
    def _parse_weather(current_data: Dict[str, Any], forecast_data: Dict[str, Any]) -> WeatherOut:
        current = WeatherCurrent(
            temperature=current_data["main"]["temp"],
            feels_like=current_data["main"]["feels_like"],
            humidity=current_data["main"]["humidity"],
            wind_speed=current_data["wind"]["speed"],
            wind_direction=current_data["wind"].get("deg", 0),
            weather=current_data["weather"][0]["main"],
            weather_description=current_data["weather"][0]["description"],
            icon=current_data["weather"][0]["icon"],
            sunrise=datetime.fromtimestamp(current_data["sys"]["sunrise"]),
            sunset=datetime.fromtimestamp(current_data["sys"]["sunset"]),
            visibility=current_data.get("visibility", 10000) / 1000,
            pressure=current_data["main"]["pressure"]
        )
        
        daily_forecast: List[WeatherForecastDay] = []
        daily_data = {}
        
        for item in forecast_data["list"]:
            date = datetime.fromtimestamp(item["dt"]).date()
            if date not in daily_data:
                daily_data[date] = {
                    "min_temp": item["main"]["temp_min"],
                    "max_temp": item["main"]["temp_max"],
                    "weather": item["weather"][0]["main"],
                    "description": item["weather"][0]["description"],
                    "icon": item["weather"][0]["icon"],
                    "humidity": item["main"]["humidity"],
                    "wind_speed": item["wind"]["speed"]
                }
            else:
                daily_data[date]["min_temp"] = min(daily_data[date]["min_temp"], item["main"]["temp_min"])
                daily_data[date]["max_temp"] = max(daily_data[date]["max_temp"], item["main"]["temp_max"])
        
        for date, data in sorted(daily_data.items())[:7]:
            daily_forecast.append(WeatherForecastDay(
                date=datetime.combine(date, datetime.min.time()),
                temperature_min=data["min_temp"],
                temperature_max=data["max_temp"],
                weather=data["weather"],
                weather_description=data["description"],
                icon=data["icon"],
                humidity=data["humidity"],
                wind_speed=data["wind_speed"]
            ))
        
        return WeatherOut(
            city_name=current_data["name"],
            country=current_data["sys"]["country"],
            current=current,
            forecast=daily_forecast
        )
    
    @staticmethod
    def clear_cache():
        cache.clear()
    
    @staticmethod
    def get_cache_stats():
        return {"hits": cache.hits, "misses": cache.misses, "size": len(cache)}