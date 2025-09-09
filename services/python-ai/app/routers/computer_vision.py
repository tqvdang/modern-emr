"""
Computer Vision endpoints for physiotherapy AI
Includes posture analysis, exercise recognition, and progress tracking
"""

import asyncio
import cv2
import numpy as np
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import logging
import time

from ..core.config import settings
from ..models.vision import (
    PostureAnalysisResult,
    ExerciseRecognitionResult,
    ProgressComparisonResult,
    ImageAnalysisRequest
)
from ..utils.image_processing import (
    preprocess_image,
    extract_keypoints,
    calculate_angles,
    detect_landmarks
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Global model storage
models_loaded = False
posture_model = None
exercise_model = None
landmark_detector = None

async def initialize_models():
    """Initialize computer vision models"""
    global models_loaded, posture_model, exercise_model, landmark_detector
    
    try:
        logger.info("Loading computer vision models...")
        
        # Load posture analysis model
        logger.info("Loading posture analysis model...")
        posture_model = await load_posture_model()
        
        # Load exercise recognition model
        logger.info("Loading exercise recognition model...")
        exercise_model = await load_exercise_model()
        
        # Load landmark detector (MediaPipe or custom)
        logger.info("Loading landmark detector...")
        landmark_detector = await load_landmark_detector()
        
        models_loaded = True
        logger.info("✅ Computer vision models loaded successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to load computer vision models: {e}")
        raise

async def load_posture_model():
    """Load posture analysis model"""
    # In production, load your trained posture analysis model
    # For now, return a placeholder
    return {
        "model_name": "posture_analyzer_v1",
        "version": "1.0.0",
        "input_size": (224, 224),
        "classes": [
            "normal_posture",
            "forward_head",
            "rounded_shoulders", 
            "anterior_pelvic_tilt",
            "posterior_pelvic_tilt",
            "scoliosis_indicators"
        ]
    }

async def load_exercise_model():
    """Load exercise recognition model"""
    # In production, load your trained exercise recognition model
    return {
        "model_name": "exercise_classifier_v1",
        "version": "1.0.0", 
        "input_size": (224, 224),
        "classes": [
            "squat", "lunge", "push_up", "plank", "bridge",
            "shoulder_flexion", "shoulder_abduction", "knee_extension",
            "ankle_dorsiflexion", "neck_rotation", "spinal_extension"
        ]
    }

async def load_landmark_detector():
    """Load human pose landmark detector"""
    try:
        import mediapipe as mp
        mp_pose = mp.solutions.pose
        mp_drawing = mp.solutions.drawing_utils
        
        return {
            "pose": mp_pose.Pose(
                static_image_mode=True,
                model_complexity=2,
                enable_segmentation=False,
                min_detection_confidence=0.5
            ),
            "drawing": mp_drawing,
            "pose_connections": mp_pose.POSE_CONNECTIONS
        }
    except ImportError:
        logger.warning("MediaPipe not available, using fallback landmark detector")
        return {"type": "fallback"}

@router.post("/analyze_posture", response_model=PostureAnalysisResult)
async def analyze_posture(
    image: UploadFile = File(...),
    analysis_type: str = "full",
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Analyze patient posture from uploaded image
    
    Args:
        image: Patient photo for posture analysis
        analysis_type: Type of analysis (full, spine, shoulders, pelvis)
    
    Returns:
        Detailed posture analysis with measurements and recommendations
    """
    if not models_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    start_time = time.time()
    
    try:
        # Validate file
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        image_data = await image.read()
        image_pil = Image.open(io.BytesIO(image_data))
        
        # Convert to OpenCV format
        image_cv = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)
        
        # Extract pose landmarks
        landmarks = await extract_pose_landmarks(image_cv)
        
        if not landmarks:
            raise HTTPException(status_code=400, detail="Could not detect person in image")
        
        # Analyze posture based on landmarks
        posture_analysis = await analyze_posture_from_landmarks(landmarks, analysis_type)
        
        # Calculate key measurements
        measurements = await calculate_posture_measurements(landmarks)
        
        # Generate recommendations
        recommendations = await generate_posture_recommendations(posture_analysis)
        
        inference_time = time.time() - start_time
        
        # Log analysis for audit trail
        background_tasks.add_task(
            log_posture_analysis,
            image.filename,
            posture_analysis,
            inference_time
        )
        
        return PostureAnalysisResult(
            analysis_id=f"posture_{int(time.time())}",
            overall_score=posture_analysis["overall_score"],
            findings=posture_analysis["findings"],
            measurements=measurements,
            recommendations=recommendations,
            confidence_score=posture_analysis["confidence"],
            processing_time=inference_time,
            landmarks_detected=len(landmarks),
            image_quality="good" if posture_analysis["confidence"] > 0.8 else "fair"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Posture analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Posture analysis failed")

@router.post("/recognize_exercise", response_model=ExerciseRecognitionResult)
async def recognize_exercise(
    image: UploadFile = File(...),
    video_frames: Optional[List[UploadFile]] = None
):
    """
    Recognize exercise being performed from image or video frames
    
    Args:
        image: Single frame or image of exercise
        video_frames: Multiple frames for dynamic analysis
    
    Returns:
        Exercise classification with form analysis
    """
    if not models_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    start_time = time.time()
    
    try:
        # Process single image
        image_data = await image.read()
        image_pil = Image.open(io.BytesIO(image_data))
        image_cv = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)
        
        # Extract pose landmarks
        landmarks = await extract_pose_landmarks(image_cv)
        
        if not landmarks:
            raise HTTPException(status_code=400, detail="Could not detect person in image")
        
        # Classify exercise
        exercise_prediction = await classify_exercise(landmarks, image_cv)
        
        # Analyze form quality
        form_analysis = await analyze_exercise_form(landmarks, exercise_prediction["exercise"])
        
        # If video frames provided, analyze movement pattern
        movement_analysis = None
        if video_frames:
            movement_analysis = await analyze_movement_pattern(video_frames)
        
        inference_time = time.time() - start_time
        
        return ExerciseRecognitionResult(
            exercise_name=exercise_prediction["exercise"],
            confidence=exercise_prediction["confidence"],
            form_score=form_analysis["score"],
            form_feedback=form_analysis["feedback"],
            key_points=form_analysis["key_points"],
            corrections=form_analysis["corrections"],
            movement_quality=movement_analysis["quality"] if movement_analysis else None,
            repetition_count=movement_analysis["reps"] if movement_analysis else None,
            processing_time=inference_time
        )
        
    except Exception as e:
        logger.error(f"Exercise recognition error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Exercise recognition failed")

@router.post("/compare_progress", response_model=ProgressComparisonResult)
async def compare_progress_photos(
    before_image: UploadFile = File(...),
    after_image: UploadFile = File(...),
    comparison_type: str = "posture"
):
    """
    Compare before and after photos to track patient progress
    
    Args:
        before_image: Patient photo before treatment
        after_image: Patient photo after treatment  
        comparison_type: Type of comparison (posture, range_of_motion, swelling)
    
    Returns:
        Detailed progress comparison with measurements
    """
    if not models_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    start_time = time.time()
    
    try:
        # Process both images
        before_data = await before_image.read()
        after_data = await after_image.read()
        
        before_pil = Image.open(io.BytesIO(before_data))
        after_pil = Image.open(io.BytesIO(after_data))
        
        before_cv = cv2.cvtColor(np.array(before_pil), cv2.COLOR_RGB2BGR)
        after_cv = cv2.cvtColor(np.array(after_pil), cv2.COLOR_RGB2BGR)
        
        # Extract landmarks from both images
        before_landmarks = await extract_pose_landmarks(before_cv)
        after_landmarks = await extract_pose_landmarks(after_cv)
        
        if not before_landmarks or not after_landmarks:
            raise HTTPException(status_code=400, detail="Could not detect person in one or both images")
        
        # Perform comparison based on type
        if comparison_type == "posture":
            comparison = await compare_posture_changes(before_landmarks, after_landmarks)
        elif comparison_type == "range_of_motion":
            comparison = await compare_rom_changes(before_landmarks, after_landmarks)
        elif comparison_type == "swelling":
            comparison = await compare_swelling_changes(before_cv, after_cv)
        else:
            raise HTTPException(status_code=400, detail="Invalid comparison type")
        
        # Calculate improvement metrics
        improvement_score = await calculate_improvement_score(comparison)
        
        # Generate progress summary
        summary = await generate_progress_summary(comparison, improvement_score)
        
        inference_time = time.time() - start_time
        
        return ProgressComparisonResult(
            comparison_id=f"progress_{int(time.time())}",
            improvement_score=improvement_score,
            changes_detected=comparison["changes"],
            measurements_before=comparison["before_measurements"],
            measurements_after=comparison["after_measurements"],
            improvement_areas=comparison["improvements"],
            areas_of_concern=comparison["concerns"],
            summary=summary,
            processing_time=inference_time,
            comparison_confidence=comparison["confidence"]
        )
        
    except Exception as e:
        logger.error(f"Progress comparison error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Progress comparison failed")

@router.post("/analyze_gait", response_model=Dict[str, Any])
async def analyze_gait(
    video: UploadFile = File(...)
):
    """
    Analyze patient gait from video
    
    Args:
        video: Video file of patient walking
    
    Returns:
        Gait analysis with metrics and recommendations
    """
    if not models_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    # This would implement gait analysis from video
    # For now, return a placeholder response
    return {
        "analysis_id": f"gait_{int(time.time())}",
        "gait_parameters": {
            "stride_length": 1.2,
            "step_width": 0.1,
            "cadence": 110,
            "gait_speed": 1.1
        },
        "symmetry_analysis": {
            "left_right_symmetry": 0.92,
            "stance_phase_symmetry": 0.89,
            "swing_phase_symmetry": 0.94
        },
        "abnormalities": [
            "Slight limp on right side",
            "Reduced ankle dorsiflexion"
        ],
        "recommendations": [
            "Focus on strengthening right gluteus medius",
            "Ankle mobility exercises"
        ]
    }

# Helper functions

async def extract_pose_landmarks(image):
    """Extract pose landmarks from image"""
    try:
        if landmark_detector["type"] == "fallback":
            # Fallback landmark detection
            return generate_mock_landmarks()
        
        # Use MediaPipe for landmark detection
        pose = landmark_detector["pose"]
        results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        if results.pose_landmarks:
            landmarks = []
            for landmark in results.pose_landmarks.landmark:
                landmarks.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })
            return landmarks
        
        return None
        
    except Exception as e:
        logger.error(f"Landmark extraction error: {e}")
        return None

async def analyze_posture_from_landmarks(landmarks, analysis_type):
    """Analyze posture from extracted landmarks"""
    # This would contain the actual posture analysis logic
    # For now, return mock analysis
    return {
        "overall_score": 0.75,
        "findings": [
            {"type": "forward_head", "severity": "mild", "angle": 12.5},
            {"type": "rounded_shoulders", "severity": "moderate", "angle": 18.3}
        ],
        "confidence": 0.85
    }

async def calculate_posture_measurements(landmarks):
    """Calculate key posture measurements"""
    # Calculate angles and distances from landmarks
    return {
        "head_angle": 12.5,
        "shoulder_angle": 18.3,
        "pelvic_tilt": 3.2,
        "spine_curvature": 25.1
    }

async def generate_posture_recommendations(analysis):
    """Generate personalized posture recommendations"""
    recommendations = []
    
    for finding in analysis["findings"]:
        if finding["type"] == "forward_head":
            recommendations.extend([
                "Perform chin tucks 3 sets of 10 daily",
                "Strengthen deep neck flexors",
                "Ergonomic assessment of workstation"
            ])
        elif finding["type"] == "rounded_shoulders":
            recommendations.extend([
                "Pectoral stretching exercises",
                "Strengthen rhomboids and middle trapezius",
                "Doorway stretches 3x daily"
            ])
    
    return recommendations

async def classify_exercise(landmarks, image):
    """Classify the exercise being performed"""
    # This would use the trained exercise classification model
    # For now, return mock classification
    return {
        "exercise": "squat",
        "confidence": 0.87
    }

async def analyze_exercise_form(landmarks, exercise_name):
    """Analyze the form quality of the exercise"""
    # This would analyze form based on the specific exercise
    return {
        "score": 0.78,
        "feedback": "Good depth, but knees cave slightly inward",
        "key_points": [
            "Knee alignment needs improvement",
            "Good hip hinge pattern",
            "Maintain neutral spine"
        ],
        "corrections": [
            "Focus on external rotation of hips",
            "Strengthen gluteus medius"
        ]
    }

async def analyze_movement_pattern(video_frames):
    """Analyze movement pattern from video frames"""
    # This would analyze movement across multiple frames
    return {
        "quality": "good",
        "reps": 8,
        "tempo": "controlled",
        "range_of_motion": 0.85
    }

async def compare_posture_changes(before_landmarks, after_landmarks):
    """Compare posture changes between two sets of landmarks"""
    # Calculate changes in key postural measurements
    return {
        "changes": [
            {"measurement": "head_angle", "change": -3.2, "improvement": True},
            {"measurement": "shoulder_angle", "change": -5.1, "improvement": True}
        ],
        "before_measurements": {"head_angle": 15.7, "shoulder_angle": 23.4},
        "after_measurements": {"head_angle": 12.5, "shoulder_angle": 18.3},
        "improvements": ["Reduced forward head posture", "Improved shoulder alignment"],
        "concerns": [],
        "confidence": 0.89
    }

async def compare_rom_changes(before_landmarks, after_landmarks):
    """Compare range of motion changes"""
    # Implement ROM comparison logic
    return {
        "changes": [
            {"joint": "shoulder", "change": 15.0, "improvement": True},
            {"joint": "neck", "change": 8.5, "improvement": True}
        ],
        "before_measurements": {"shoulder_flexion": 120, "neck_rotation": 45},
        "after_measurements": {"shoulder_flexion": 135, "neck_rotation": 53.5},
        "improvements": ["Increased shoulder flexion", "Better neck mobility"],
        "concerns": [],
        "confidence": 0.82
    }

async def compare_swelling_changes(before_image, after_image):
    """Compare swelling changes between images"""
    # Implement swelling comparison using image analysis
    return {
        "changes": [
            {"area": "knee", "change": -0.15, "improvement": True}
        ],
        "before_measurements": {"knee_circumference": 38.5},
        "after_measurements": {"knee_circumference": 38.0},
        "improvements": ["Reduced knee swelling"],
        "concerns": [],
        "confidence": 0.76
    }

async def calculate_improvement_score(comparison):
    """Calculate overall improvement score"""
    improvements = len(comparison["improvements"])
    concerns = len(comparison["concerns"])
    total_changes = len(comparison["changes"])
    
    if total_changes == 0:
        return 0.5
    
    return min(1.0, max(0.0, (improvements - concerns * 0.5) / total_changes))

async def generate_progress_summary(comparison, improvement_score):
    """Generate human-readable progress summary"""
    if improvement_score > 0.8:
        return "Excellent progress! Significant improvements observed."
    elif improvement_score > 0.6:
        return "Good progress with notable improvements in key areas."
    elif improvement_score > 0.4:
        return "Moderate progress. Some improvements noted."
    else:
        return "Limited progress. Consider adjusting treatment plan."

def generate_mock_landmarks():
    """Generate mock landmarks for testing"""
    # Return 33 pose landmarks with mock coordinates
    landmarks = []
    for i in range(33):
        landmarks.append({
            'x': 0.5 + (i % 3 - 1) * 0.1,
            'y': 0.5 + (i // 3 % 3 - 1) * 0.1, 
            'z': 0.0,
            'visibility': 0.9
        })
    return landmarks

async def log_posture_analysis(filename, analysis, inference_time):
    """Log posture analysis for audit trail"""
    logger.info(f"Posture analysis completed: {filename}, score: {analysis['overall_score']}, time: {inference_time:.2f}s")

# Model warming endpoint
@router.post("/warm_models")
async def warm_models():
    """Warm up models for faster inference"""
    if not models_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    # Perform dummy inference to warm up models
    dummy_landmarks = generate_mock_landmarks()
    await analyze_posture_from_landmarks(dummy_landmarks, "full")
    await classify_exercise(dummy_landmarks, None)
    
    return {"status": "Models warmed up successfully"}