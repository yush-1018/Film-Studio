import asyncio
from typing import Dict, Any
from langgraph.graph import StateGraph, END
from app.graph.state import FilmStudioState
from app.providers.factory import get_video_provider_chain
from app.services.video_engine import LocalVideoEngine


async def scriptwriter_agent(state: FilmStudioState) -> Dict[str, Any]:
    prompt = state.get("user_prompt", "Cinematic Scene")
    script_data = {
        "title": prompt[:30] if len(prompt) > 30 else prompt,
        "scenes": [
            {
                "id": 1,
                "heading": "EXT. CINEMATIC SCENE - DAY",
                "action": prompt,
            }
        ],
    }
    return {"script": script_data}


async def storyboard_agent(state: FilmStudioState) -> Dict[str, Any]:
    prompt = state.get("user_prompt", "Cinematic shot")
    shots = [
        {
            "shot_id": 1,
            "prompt": prompt,
            "camera": "Dynamic 35mm cinematic tracking shot",
        }
    ]
    return {"storyboard": shots}


async def voice_sound_agent(state: FilmStudioState) -> Dict[str, Any]:
    audio = {
        "dialogue_url": "/generated_videos/dialogue.mp3",
        "bgm_url": "/generated_videos/soundtrack.mp3",
    }
    return {"audio_tracks": audio}


async def editor_agent(state: FilmStudioState) -> Dict[str, Any]:
    video_chain = get_video_provider_chain()
    prompt = state.get("storyboard", [{}])[0].get("prompt", state.get("user_prompt", "Cinematic Film"))

    clip_result = await video_chain.generate_video(prompt=prompt)
    video_url = clip_result.video_url if hasattr(clip_result, "video_url") else clip_result.get("video_url")
    return {"final_video_url": video_url}


def build_film_studio_graph():
    workflow = StateGraph(FilmStudioState)

    workflow.add_node("scriptwriter", scriptwriter_agent)
    workflow.add_node("storyboard", storyboard_agent)
    workflow.add_node("voice_sound", voice_sound_agent)
    workflow.add_node("editor", editor_agent)

    workflow.set_entry_point("scriptwriter")
    workflow.add_edge("scriptwriter", "storyboard")
    workflow.add_edge("storyboard", "voice_sound")
    workflow.add_edge("voice_sound", "editor")
    workflow.add_edge("editor", END)

    return workflow.compile()
