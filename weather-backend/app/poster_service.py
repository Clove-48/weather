from typing import Dict, List

class PosterService:
    @staticmethod
    def get_available_styles() -> List[Dict[str, str]]:
        return [
            {"id": "watercolor", "name": "水彩风格"},
            {"id": "pixel", "name": "像素风格"},
            {"id": "ukiyo-e", "name": "浮世绘风格"},
            {"id": "cyberpunk", "name": "赛博朋克风格"},
            {"id": "minimalist", "name": "极简风格"},
            {"id": "anime", "name": "动漫风格"}
        ]
    
    @staticmethod
    async def generate_poster(weather_data: Dict, style: str) -> str:
        import base64
        city_name = weather_data.get("city_name", "Unknown")
        weather = weather_data.get("current", {}).get("weather", "sunny")
        temp = weather_data.get("current", {}).get("temperature", 0)
        
        svg_content = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="skyblue"/>
  <text x="200" y="100" text-anchor="middle" font-size="24" fill="white">{city_name}</text>
  <text x="200" y="150" text-anchor="middle" font-size="20" fill="white">{weather}</text>
  <text x="200" y="200" text-anchor="middle" font-size="36" fill="white">{temp}°C</text>
  <text x="200" y="250" text-anchor="middle" font-size="16" fill="white">Style: {style}</text>
</svg>
        """.strip()
        
        return base64.b64encode(svg_content.encode()).decode()
