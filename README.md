<<<<<<< HEAD
# pranaedge
PranaEdge is an AI-powered wellness ecosystem designed to bridge the gap between traditional practices and modern technology. The platform features real-time yoga pose correction using computer vision and personalized AI-driven meditation sessions, providing users with a comprehensive, data-backed approach to physical and mental health.
=======
# PranaEdge

PranaEdge is an AI-powered wellness platform designed to support physical and mental well-being through real-time yoga pose correction, personalized meditation, nutrition analysis, sleep tracking, community interaction, and intelligent chatbot assistance. The system integrates artificial intelligence, computer vision, and modern web technologies to provide an accessible and personalized wellness experience.

---

## Overview

Modern lifestyles often involve high stress, irregular routines, and limited access to professional wellness guidance. PranaEdge addresses these challenges by bringing together multiple wellness features into a single unified platform. It provides real-time posture correction during yoga practice, emotion-based meditation guidance, lifestyle tracking, and continuous user support through an AI chatbot.

The platform is designed for users who want a simple, guided, and intelligent way to improve both physical fitness and mental health from their own space.

---

## Key Features

- Real-time yoga pose correction using webcam input  
- Visual and voice-based feedback for posture alignment  
- Emotion-based AI-guided meditation generation  
- Nutrition and food analysis using structured datasets  
- Sleep tracking with habit analysis and recommendations  
- Community space with live yoga sessions  
- AI-powered chatbot for wellness guidance and support  
- Secure user authentication and personalized dashboards  

---

## System Architecture

PranaEdge follows a modular architecture that separates frontend interaction, backend processing, and data storage.

- The frontend captures user input, webcam frames, and displays real-time feedback.  
- The backend processes AI logic, pose correction, meditation generation, and data analysis.  
- The database stores user profiles, activity history, and wellness data for personalization.

---

## Technology Stack

### Frontend
- React with TypeScript  
- Vite  
- Tailwind CSS  
- Webcam API  
- Axios  

### Backend
- Flask (Python)  
- RESTful APIs  
- JWT Authentication  

### AI and Machine Learning
- MediaPipe Pose  
- OpenCV  
- Single Neuron Network (Perceptron)  
- Adam Optimization  
- Gemini API (Meditation and Chatbot)  

### Data
- Custom collected yoga pose dataset  
- CSV datasets for nutrition and sleep tracking  

### Database
- MongoDB Atlas  

### Tools
- Visual Studio Code  
- Git and GitHub  
- Postman  

---

## How It Works

1. Users register and log in securely using JWT-based authentication.  
2. The yoga module captures webcam frames, converts them to Base64, and sends them to the backend.  
3. MediaPipe and OpenCV extract keypoints, and the AI model evaluates posture accuracy.  
4. Real-time feedback is returned to the frontend with minimal latency.  
5. Meditation scripts are generated dynamically using the Gemini API based on user emotions.  
6. Nutrition and sleep data are analyzed using CSV reference datasets.  
7. Users interact through the community feature and receive support via the AI chatbot.

---

## Performance

- Yoga pose correction latency reduced from 5–7 seconds to 200–500 milliseconds using Base64 frame transfer  
- Pose correction accuracy of approximately 93 percent  
- Nutrition and sleep analysis accuracy of approximately 95 percent  
- High relevance and user satisfaction in AI-generated meditation guidance  

---

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/DivyashreeR25/pranaedge.git
>>>>>>> 133db072e1d46cf600f7a4cd9650bf76b8eb4209
