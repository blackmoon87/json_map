export const INITIAL_JSON = JSON.stringify(
  {
    "company": "TechFlow AI",
    "founded": 2024,
    "active": true,
    "departments": [
      {
        "name": "Engineering",
        "headCount": 45,
        "lead": {
          "name": "Sarah Chen",
          "role": "CTO",
          "skills": ["React", "Rust", "AI"]
        }
      },
      {
        "name": "Design",
        "headCount": 12,
        "tools": ["Figma", "Adobe"]
      }
    ],
    "location": {
      "city": "San Francisco",
      "coordinates": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    }
  },
  null,
  2
);

export const NODE_WIDTH = 280;
export const ROW_HEIGHT = 28;
export const HEADER_HEIGHT = 40;
