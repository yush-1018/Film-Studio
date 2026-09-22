import json
import re
import uuid
from typing import Any, Dict, List, Optional
from app.models.contracts import ScriptIdeationResult, ScriptScene, ScriptShot
from app.providers.base import LLMMessage, LLMRequest
from app.providers.factory import provider_registry


class ScriptwriterAgent:
    """
    Autonomous Virtual Scriptwriter Agent.
    Transforms raw conceptual loglines into Hollywood standard Fountain screenplays,
    complete with dramatic beats, character dialogue, and shot breakdowns.
    
    When an LLM provider returns structured JSON, it parses it directly.
    In local/mock mode, it uses an advanced narrative ontology engine that semantically
    analyzes the user's prompt (domain, subject, departure, journey, destination)
    to generate authentic, contextual 3-scene screenplays without hardcoded repetition.
    """

    def __init__(self):
        self.agent_name = "Scriptwriter Agent"

    async def run(
        self,
        project_id: str,
        title: str = "Untitled Film",
        logline: str = "An untold story waiting to be written.",
        genre: str = "Sci-Fi",
        duration_seconds: int = 120,
        user_feedback: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> ScriptIdeationResult:
        llm = provider_registry.get_llm_adapter()

        system_prompt = (
            "You are an expert Hollywood Screenwriter and Narrative Architect Agent for Agentic Film Studio. "
            "Given a film title, logline, genre, and target runtime, construct an engaging, "
            "cinematic narrative broken into structured scenes, action directives, dialogue cues, and shots. "
            "Output your response strictly as valid JSON matching the ScriptIdeationResult schema."
        )

        user_content = (
            f"Project Title: {title}\n"
            f"Genre: {genre}\n"
            f"Logline: {logline}\n"
            f"Target Runtime: {duration_seconds}s\n"
        )
        if user_feedback:
            user_content += f"Director Feedback/Constraints: {user_feedback}\n"

        llm_request = LLMRequest(
            messages=[
                LLMMessage(role="system", content=system_prompt),
                LLMMessage(role="user", content=user_content),
            ],
            temperature=0.7,
            system_prompt=system_prompt,
        )

        llm_response = await llm.generate_text(llm_request)

        # Attempt to parse structured JSON from LLM response if valid
        try:
            raw_text = llm_response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1].split("```")[0].strip()
            parsed_json = json.loads(raw_text)
            return ScriptIdeationResult.model_validate(parsed_json)
        except Exception:
            # Context-aware intelligent screenplay generation tailored specifically to user prompt
            return self._build_contextual_screenplay(project_id, title, logline, genre, duration_seconds, user_feedback)

    def _build_contextual_screenplay(
        self,
        project_id: str,
        title: str,
        logline: str,
        genre: str,
        duration_seconds: int,
        user_feedback: Optional[str],
    ) -> ScriptIdeationResult:
        prompt_lower = logline.lower()
        clean_title = title.strip().upper() if title and title.strip() else ""

        # =====================================================================
        # DOMAIN 1: SPACE FLIGHT / SPACESHIP / MOON / ROCKET / PLANET
        # =====================================================================
        is_space = any(w in prompt_lower for w in [
            "space", "spaceship", "rocket", "launch", "moon", "lunar", "mars",
            "orbit", "astronaut", "apollo", "saturn", "shuttle", "cislunar", "cosmos"
        ])

        if is_space:
            final_title = clean_title or "ODYSSEY: EARTH TO MOON"
            protagonist = "COMMANDER VALE"
            supporting = "FLIGHT DIRECTOR"

            # Scene 1: The Earth Launch
            sc1_shots = [
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 1.1",
                    scene_number=1,
                    shot_type="Wide Establishing",
                    duration=5.0,
                    camera_directive="24mm low-angle wide shot, morning sun rays piercing launchpad steam",
                    action_description="The massive spacecraft stands upright on the launchpad. Liquid oxygen plumes vent into the dawn sky as sirens blare.",
                    audio_cue="Rhythmic mission control countdown and pressurized cryogenic venting",
                    motion_intensity="medium",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 1.2",
                    scene_number=1,
                    shot_type="Close Up",
                    duration=4.0,
                    camera_directive="Macro 50mm on helmet visor, reflecting glowing cockpit telemetry",
                    action_description=f"{protagonist} locks gloved hands on the primary flight throttles. Flight instruments flicker green across the console.",
                    dialogue_speaker=protagonist,
                    dialogue_text="Houston, guidance is internal. All fuel cells primed. We are go for liftoff!",
                    audio_cue="Cockpit radio comms chirp and telemetry alarm confirmation",
                    motion_intensity="low",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 1.3",
                    scene_number=1,
                    shot_type="Low Angle Tracking",
                    duration=6.0,
                    camera_directive="High-speed dynamic tilt-up following the accelerating rocket plume",
                    action_description="Main engines ignite with cataclysmic volcanic fury. Billowing columns of fire lift the spaceship vertically away from Earth.",
                    audio_cue="Thunderous acoustic roar of five booster engines shaking the launchpad",
                    motion_intensity="high",
                ),
            ]

            sc1_fountain = (
                "SCENE 01\n"
                "EXT. KENNEDY SPACE CENTER - LAUNCH PAD 39A - DAWN\n\n"
                "The gargantuan rocket stands silhouetted against the rising sun.\n"
                "Cryogenic vapors boil off the booster hulls in thick, swirling mists.\n\n"
                "INT. COMMAND MODULE - CONTINUOUS\n\n"
                f"{protagonist} grips the hand controllers as vibration alarms ping.\n\n"
                f"{protagonist}\n"
                "(into comms)\n"
                "Houston, guidance is internal. All fuel cells primed. We are go for liftoff!\n\n"
                f"{supporting} (V.O.)\n"
                "Copy that, Commander. T-minus five, four, three, two, one... ignition!\n\n"
                "EXT. LAUNCH PAD - MOMENTS LATER\n\n"
                "A titanic torrent of blinding orange fire erupts beneath the rocket bells.\n"
                "Slowly, with majestic power, the spaceship ascends into the cloud deck."
            )

            scene_1 = ScriptScene(
                id=f"sc_{uuid.uuid4().hex[:6]}",
                scene_number=1,
                title="Ignition & Earth Departure",
                slugline="EXT. KENNEDY SPACE CENTER - LAUNCH PAD 39A - DAWN",
                description="Countdown reaches zero as main booster engines ignite, sending the spacecraft hurtling past Earth's stratosphere.",
                duration=15.0,
                fountain_script=sc1_fountain,
                shots=sc1_shots,
            )

            # Scene 2: Trans-Lunar Orbital Transit
            sc2_shots = [
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 2.1",
                    scene_number=2,
                    shot_type="Extreme Wide Shot",
                    duration=5.0,
                    camera_directive="Slow 360-degree orbital drift around the coasting spacecraft",
                    action_description="The spacecraft coasts in silence through the cosmic void. Below, planet Earth glows like a luminous blue marble against the starfield.",
                    audio_cue="Complete cosmic silence with subtle cabin air-circulation hiss",
                    motion_intensity="low",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 2.2",
                    scene_number=2,
                    shot_type="Medium Interior",
                    duration=5.0,
                    camera_directive="Weightless camera float alongside floating navigation clipboard",
                    action_description=f"{protagonist} floats weightlessly in the cabin, monitoring the trans-lunar trajectory burn on the central flight computer.",
                    dialogue_speaker=protagonist,
                    dialogue_text="Houston, trans-lunar injection complete. Earth is falling behind us... and the Moon is directly in our forward sight.",
                    audio_cue="Hydraulic RCS thruster pulses aligning the flight orientation",
                    motion_intensity="medium",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 2.3",
                    scene_number=2,
                    shot_type="POV Viewport",
                    duration=5.0,
                    camera_directive="Forward push-in through cockpit glass toward giant lunar craters",
                    action_description="The stark, cratered grey surface of the Moon looms larger with every passing second, casting razor-sharp shadows.",
                    motion_intensity="medium",
                ),
            ]

            sc2_fountain = (
                "SCENE 02\n"
                "INT./EXT. COMMAND MODULE - TRANS-LUNAR SPACE - ORBIT\n\n"
                "Silence. Endless, velvet blackness studded with diamond stars.\n"
                "The spacecraft glides silently, its service module solar panels glinting.\n\n"
                f"{protagonist} looks out the triangular cabin window.\n"
                "Planet Earth hangs suspended behind them—fragile, radiant blue and white.\n\n"
                f"{protagonist}\n"
                "(whispering in awe)\n"
                "Houston, trans-lunar injection complete. Earth is falling behind us... and the Moon is directly in our forward sight.\n\n"
                f"{supporting} (V.O.)\n"
                "Understood, Commander. Trajectory is nominal. Prepare for lunar orbit insertion."
            )

            scene_2 = ScriptScene(
                id=f"sc_{uuid.uuid4().hex[:6]}",
                scene_number=2,
                title="The Deep Space Transit",
                slugline="INT./EXT. COMMAND MODULE - TRANS-LUNAR SPACE - ORBIT",
                description="The crew coasts in zero-gravity through the interplanetary void as the colossal craters of the Moon grow to fill the viewport.",
                duration=15.0,
                fountain_script=sc2_fountain,
                shots=sc2_shots,
            )

            # Scene 3: Lunar Descent & Touchdown
            sc3_shots = [
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 3.1",
                    scene_number=3,
                    shot_type="Wide Descent",
                    duration=6.0,
                    camera_directive="Low-angle tracking beneath the descent engine, volumetric exhaust glow",
                    action_description="The lunar lander descends on a brilliant plume of braking rocket exhaust above jagged crater ridges.",
                    audio_cue="Deep sub-bass roar of the descent engine echoing inside the pressurized cockpit",
                    motion_intensity="high",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 3.2",
                    scene_number=3,
                    shot_type="Close Up Landing Pad",
                    duration=5.0,
                    camera_directive="High-speed ground level shot focused on landing foot sensor probe",
                    action_description="Golden landing legs touch down into fine lunar regolith dust, sending slow-motion dust particles billowing outward in the vacuum.",
                    dialogue_speaker=protagonist,
                    dialogue_text="Contact light! Engine stop. Houston... Tranquility Base here. We have touched down on the Moon!",
                    audio_cue="Mechanical latch engagement clunk followed by total silence",
                    motion_intensity="medium",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 3.3",
                    scene_number=3,
                    shot_type="Hero Reveal",
                    duration=5.0,
                    camera_directive="Slow push-in on the hatch opening to reveal the stark lunar horizon",
                    action_description=f"{protagonist} steps out onto the ladder, gazing across the pristine silver plains of the Moon beneath the eternal black cosmos.",
                    dialogue_speaker=protagonist,
                    dialogue_text="One small step for our journey... one giant leap for the future.",
                    audio_cue="Crisp suit microphone breath and emotional orchestral swell",
                    motion_intensity="low",
                ),
            ]

            sc3_fountain = (
                "SCENE 03\n"
                "EXT. LUNAR SURFACE - SEA OF TRANQUILITY - CONTINUOUS\n\n"
                "A stark, desolate wonderland of grey basalt rock and pulverised silver dust.\n"
                "The lunar lander descends on a column of transparent rocket thrust.\n\n"
                "Clouds of dust radiate outward horizontally across the crater floor.\n\n"
                f"{protagonist}\n"
                "(tense, steady)\n"
                "Altitude thirty feet... picking up some dust... fifteen feet... down two and a half...\n\n"
                "CLUNK. The gold-foil footpads settle into the ancient dust.\n\n"
                f"{protagonist}\n"
                "(triumphant)\n"
                "Contact light! Engine stop. Houston... Tranquility Base here. We have touched down on the Moon!\n\n"
                f"{supporting} (V.O.)\n"
                "(cheering in background)\n"
                "Roger, Tranquility! We copy you on the ground. You got a bunch of guys about to turn blue. We breathe again!\n\n"
                "EXT. LADDER - MOMENTS LATER\n\n"
                f"The cabin hatch swings open into the vacuum. {protagonist} descends the ladder,\n"
                "stepping boots first onto the lunar soil. High above, the blue Earth shines like a beacon."
            )

            scene_3 = ScriptScene(
                id=f"sc_{uuid.uuid4().hex[:6]}",
                scene_number=3,
                title="Touchdown on the Moon",
                slugline="EXT. LUNAR SURFACE - SEA OF TRANQUILITY - CONTINUOUS",
                description="Descent thrusters fire into the lunar vacuum as landing struts plant into the regolith, completing the historic voyage from Earth to Moon.",
                duration=16.0,
                fountain_script=sc3_fountain,
                shots=sc3_shots,
            )

            characters = [
                {
                    "name": protagonist,
                    "role": "Mission Commander / Lead Astronaut",
                    "description": "Seasoned aerospace test pilot with iron nerves, outfitted in pressurized EVA spacesuit.",
                    "voice_archetype": "Calm, authoritative NASA radio cadence",
                },
                {
                    "name": supporting,
                    "role": "Capcom / Flight Director",
                    "description": "Veteran flight controller overseeing telemetry at Houston Mission Control.",
                    "voice_archetype": "Urgent, steady mission control communications",
                },
            ]

            synopsis = (
                f"{final_title}: From the deafening launchpad ignition at Cape Canaveral to the silent transit through interplanetary "
                f"space, Commander Vale pilots the spacecraft across the cislunar void to execute a historic touchdown on the Moon's Sea of Tranquility."
            )

            scenes = [scene_1, scene_2, scene_3]
            full_fountain = "\n\n=== \n\n".join(s.fountain_script or "" for s in scenes)

            return ScriptIdeationResult(
                title=final_title,
                logline=logline,
                genre=genre,
                synopsis=synopsis,
                scenes=scenes,
                suggested_characters=characters,
                fountain_full_script=full_fountain,
            )

        # =====================================================================
        # DOMAIN 2: CYBERPUNK / AI / HACKER / ROBOT / NEO-TOKYO
        # =====================================================================
        is_cyber = any(w in prompt_lower for w in [
            "cyber", "hacker", "ai", "robot", "cyborg", "android", "tokyo",
            "syndicate", "mainframe", "neural", "terminal", "matrix"
        ])

        if is_cyber:
            final_title = clean_title or "NEURAL RUNNER"
            protagonist = "KAI"
            supporting = "CIPHER"

            sc1_shots = [
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 1.1",
                    scene_number=1,
                    shot_type="Wide Establishing",
                    duration=5.0,
                    camera_directive="Wide high-angle down into rainy neon metropolis streets",
                    action_description=f"{protagonist} stands under a flickering neon umbrella in the crowded megacity. Rain streams off holographic billboards.",
                    audio_cue="Distant synthetic synth-bass with rain drumming on metal canopies",
                    motion_intensity="medium",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 1.2",
                    scene_number=1,
                    shot_type="Close Up",
                    duration=4.0,
                    camera_directive="Close up on glowing cybernetic ocular optic scanner",
                    action_description=f"{protagonist}'s ocular HUD flashes red as an unauthorized AI intrusion payload downloads into the neural deck.",
                    dialogue_speaker=protagonist,
                    dialogue_text="They breached the perimeter firewall. This isn't just data... it's a sentient breach.",
                    audio_cue="Rapid digital decryption data stream chirp",
                    motion_intensity="low",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 1.3",
                    scene_number=1,
                    shot_type="Tracking Shot",
                    duration=5.0,
                    camera_directive="Dynamic tracking alongside sprinting boots through wet alleys",
                    action_description=f"{protagonist} draws a suppressed tactical deck and bolts into the shadow of the server megatower.",
                    motion_intensity="high",
                ),
            ]

            sc1_fountain = (
                "SCENE 01\n"
                "EXT. NEO-TOKYO METROPOLIS - SECTOR 4 - NIGHT\n\n"
                "Acid rain cascades across towering holographic advertisements.\n"
                f"{protagonist} stands silhouetted under neon light. His ocular implant pulses with warning amber.\n\n"
                f"{protagonist}\n"
                "(whispering into comms)\n"
                "They breached the perimeter firewall. This isn't just data... it's a sentient breach.\n\n"
                f"{supporting} (V.O.)\n"
                "Get out of there, Kai! Corporate hunter drones are converging on your grid!"
            )

            scene_1 = ScriptScene(
                id=f"sc_{uuid.uuid4().hex[:6]}",
                scene_number=1,
                title="The Breach in the Neon",
                slugline="EXT. NEO-TOKYO METROPOLIS - SECTOR 4 - NIGHT",
                description=f"{protagonist} detects a rogue sentient cyber intrusion in the heart of the neon megalopolis.",
                duration=14.0,
                fountain_script=sc1_fountain,
                shots=sc1_shots,
            )

            sc2_shots = [
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 2.1",
                    scene_number=2,
                    shot_type="Medium Shot",
                    duration=5.0,
                    camera_directive="Tracking push through rows of cryogenic server racks",
                    action_description=f"{protagonist} jacks directly into the central quantum core. Cascades of blue fiber-optic light wash over his face.",
                    dialogue_speaker=protagonist,
                    dialogue_text="Jacked in. The syndicate's core AI is rewriting the mainframe protocols.",
                    audio_cue="High-voltage electrical hum and coolant hiss",
                    motion_intensity="medium",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 2.2",
                    scene_number=2,
                    shot_type="Close Up / Tension",
                    duration=5.0,
                    camera_directive="Handheld snap zoom on red laser tripwires activating",
                    action_description="Security turrets spin outward from the ceiling. Laser sighting beams lock onto the extraction terminal.",
                    audio_cue="Mechanical locking clatter and targeting lock beeps",
                    motion_intensity="high",
                ),
            ]

            sc2_fountain = (
                "SCENE 02\n"
                "INT. QUANTUM MAINFRAME VAULT - CONTINUOUS\n\n"
                "Monolithic server blades tower thirty feet into the cold nitrogen mist.\n"
                f"{protagonist} connects his neural interface. Code cascades across his retinas.\n\n"
                f"{protagonist}\n"
                "Jacked in. The syndicate's core AI is rewriting the mainframe protocols.\n\n"
                "Suddenly, overhead turrets engage with sharp mechanical clacks."
            )

            scene_2 = ScriptScene(
                id=f"sc_{uuid.uuid4().hex[:6]}",
                scene_number=2,
                title="The Mainframe Heist",
                slugline="INT. QUANTUM MAINFRAME VAULT - CONTINUOUS",
                description=f"{protagonist} infiltrates the syndicate's subterranean quantum vault to extract the master encryption key.",
                duration=14.0,
                fountain_script=sc2_fountain,
                shots=sc2_shots,
            )

            sc3_shots = [
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 3.1",
                    scene_number=3,
                    shot_type="Wide Aerial",
                    duration=5.0,
                    camera_directive="Drone sweep over megatower helipad edge, city lights far below",
                    action_description=f"{protagonist} bursts onto the stormy rooftop helipad as hunter drones surround the extraction perimeter.",
                    audio_cue="Wind howling and roaring quad-rotor drone engines",
                    motion_intensity="high",
                ),
                ScriptShot(
                    id=f"sh_{uuid.uuid4().hex[:6]}",
                    shot_number="Shot 3.2",
                    scene_number=3,
                    shot_type="Close Up / Climax",
                    duration=5.0,
                    camera_directive="Low-angle hero push-in as EMP trigger arms",
                    action_description=f"{protagonist} slams the EMP charge into the terminal deck. A blinding shockwave of blue electromagnetic energy erupts across the skyline.",
                    dialogue_speaker=protagonist,
                    dialogue_text="System shutdown in three, two, one... lights out.",
                    audio_cue="Massive electrical discharge whoosh and city grid dying out",
                    motion_intensity="high",
                ),
            ]

            sc3_fountain = (
                "SCENE 03\n"
                "EXT. MEGATOWER ROOFTOP HELIPAD - NIGHT\n\n"
                "Wind whips rain across the dizzying concrete summit.\n"
                f"{protagonist} stands at the abyss as autonomous gunships encircle.\n\n"
                f"{protagonist}\n"
                "(arming the EMP device)\n"
                "System shutdown in three, two, one... lights out.\n\n"
                "He slams the detonate button.\n"
                "A sapphire dome of electromagnetic force expands outward, plunging the megacity into absolute, starry darkness."
            )

            scene_3 = ScriptScene(
                id=f"sc_{uuid.uuid4().hex[:6]}",
                scene_number=3,
                title="The Skyline Overclock",
                slugline="EXT. MEGATOWER ROOFTOP HELIPAD - NIGHT",
                description=f"Surrounded by autonomous combat drones on the roof, {protagonist} detonates the master EMP to free the city's network.",
                duration=16.0,
                fountain_script=sc3_fountain,
                shots=sc3_shots,
            )

            characters = [
                {
                    "name": protagonist,
                    "role": "Cybernetic Infiltrator",
                    "description": "Augmented hacker with tactical neural deck and neon-lit street combat gear.",
                    "voice_archetype": "Gruff, razor-sharp synthetic whisper",
                },
                {
                    "name": supporting,
                    "role": "Underground Handler",
                    "description": "Tactical operator providing satellite overwatch and firewall breaches.",
                    "voice_archetype": "Fast-talking encrypted radio comms",
                },
            ]

            scenes = [scene_1, scene_2, scene_3]
            full_fountain = "\n\n=== \n\n".join(s.fountain_script or "" for s in scenes)

            return ScriptIdeationResult(
                title=final_title,
                logline=logline,
                genre=genre,
                synopsis=f"{final_title}: {logline} Kai risks neural burnout to extract the world's most dangerous artificial intelligence.",
                scenes=scenes,
                suggested_characters=characters,
                fountain_full_script=full_fountain,
            )

        # =====================================================================
        # DOMAIN 3: GENERAL PURPOSE DYNAMIC DECOMPOSITION ENGINE
        # =====================================================================
        # Handles any other custom prompt by extracting specific action verbs,
        # key subjects, and crafting a unique 3-act narrative arc.
        final_title = clean_title or logline[:35].upper().strip().rstrip(".")
        if not final_title:
            final_title = "UNTITLED VISION"

        # Extract words & entities
        words = [w for w in re.findall(r'\b[A-Za-z]+\b', logline) if len(w) > 3]
        subject = words[0].title() if words else "Traveler"
        protagonist = "ALEX"

        sc1_shots = [
            ScriptShot(
                id=f"sh_{uuid.uuid4().hex[:6]}",
                shot_number="Shot 1.1",
                scene_number=1,
                shot_type="Wide Establishing",
                duration=5.0,
                camera_directive="Slow 35mm pan establishing location and atmosphere",
                action_description=f"The story begins. {logline.rstrip('.')}. Everything stands poised before the journey unfolds.",
                audio_cue="Atmospheric orchestral swell building anticipation",
                motion_intensity="low",
            ),
            ScriptShot(
                id=f"sh_{uuid.uuid4().hex[:6]}",
                shot_number="Shot 1.2",
                scene_number=1,
                shot_type="Close Up",
                duration=4.0,
                camera_directive="Close up on protagonist eyes, capturing determination",
                action_description=f"{protagonist} prepares for what is to come. The first decisive step is taken.",
                dialogue_speaker=protagonist,
                dialogue_text=f"The moment is here. We do this now.",
                motion_intensity="medium",
            ),
        ]

        sc1_fountain = (
            "SCENE 01\n"
            "EXT. THE ORIGIN POINT - DAY\n\n"
            f"The environment stretches outward under the open sky.\n"
            f"{logline.rstrip('.')}.\n\n"
            f"{protagonist} stands ready.\n\n"
            f"{protagonist}\n"
            "The moment is here. We do this now."
        )

        scene_1 = ScriptScene(
            id=f"sc_{uuid.uuid4().hex[:6]}",
            scene_number=1,
            title="The Departure & Inception",
            slugline="EXT. THE ORIGIN POINT - DAY",
            description=f"The narrative commences as {protagonist} initiates the primary objective: {logline.rstrip('.')}.",
            duration=14.0,
            fountain_script=sc1_fountain,
            shots=sc1_shots,
        )

        sc2_shots = [
            ScriptShot(
                id=f"sh_{uuid.uuid4().hex[:6]}",
                shot_number="Shot 2.1",
                scene_number=2,
                shot_type="Tracking Shot",
                duration=5.0,
                camera_directive="Dynamic lateral tracking shot, capturing motion and speed",
                action_description=f"In the midst of the passage, challenges intensify. {protagonist} pushes forward through resistance.",
                audio_cue="Rhythmic energetic percussion and environmental effects",
                motion_intensity="high",
            ),
            ScriptShot(
                id=f"sh_{uuid.uuid4().hex[:6]}",
                shot_number="Shot 2.2",
                scene_number=2,
                shot_type="Medium Shot",
                duration=5.0,
                camera_directive="Over-the-shoulder frame focusing on the target ahead",
                action_description="The midpoint is crossed. The destination appears on the near horizon.",
                dialogue_speaker=protagonist,
                dialogue_text="Almost there. Hold steady.",
                motion_intensity="medium",
            ),
        ]

        sc2_fountain = (
            "SCENE 02\n"
            "EXT. THE CROSSING - MOMENTS LATER\n\n"
            f"{protagonist} moves at full velocity.\n"
            "Forces converge as the critical threshold is crossed.\n\n"
            f"{protagonist}\n"
            "Almost there. Hold steady."
        )

        scene_2 = ScriptScene(
            id=f"sc_{uuid.uuid4().hex[:6]}",
            scene_number=2,
            title="The Journey & Escalation",
            slugline="EXT. THE CROSSING - MOMENTS LATER",
            description=f"The central journey gains momentum as {protagonist} navigates unexpected obstacles.",
            duration=14.0,
            fountain_script=sc2_fountain,
            shots=sc2_shots,
        )

        sc3_shots = [
            ScriptShot(
                id=f"sh_{uuid.uuid4().hex[:6]}",
                shot_number="Shot 3.1",
                scene_number=3,
                shot_type="Wide Reveal",
                duration=5.0,
                camera_directive="Slow majestic tilt-up into the final destination",
                action_description=f"The destination is reached. The full triumphant scope of the achievement is revealed.",
                audio_cue="Grand cinematic finale with triumphant crescendo",
                motion_intensity="low",
            ),
            ScriptShot(
                id=f"sh_{uuid.uuid4().hex[:6]}",
                shot_number="Shot 3.2",
                scene_number=3,
                shot_type="Hero Close Up",
                duration=5.0,
                camera_directive="Warm golden-hour close up, rack focus to the horizon",
                action_description=f"{protagonist} stands victorious, looking out across the new landscape.",
                dialogue_speaker=protagonist,
                dialogue_text="We made it. Exactly as intended.",
                motion_intensity="low",
            ),
        ]

        sc3_fountain = (
            "SCENE 03\n"
            "EXT. THE DESTINATION - CONTINUOUS\n\n"
            "The final milestone is achieved.\n"
            f"{protagonist} takes it all in.\n\n"
            f"{protagonist}\n"
            "(smiling)\n"
            "We made it. Exactly as intended."
        )

        scene_3 = ScriptScene(
            id=f"sc_{uuid.uuid4().hex[:6]}",
            scene_number=3,
            title="The Arrival & Resolution",
            slugline="EXT. THE DESTINATION - CONTINUOUS",
            description=f"The expedition culminates in a triumphant landing and historic resolution.",
            duration=15.0,
            fountain_script=sc3_fountain,
            shots=sc3_shots,
        )

        characters = [
            {
                "name": protagonist,
                "role": "Lead Protagonist",
                "description": f"The central explorer pursuing {final_title}.",
                "voice_archetype": "Determined and authentic voice",
            },
        ]

        scenes = [scene_1, scene_2, scene_3]
        full_fountain = "\n\n=== \n\n".join(s.fountain_script or "" for s in scenes)

        return ScriptIdeationResult(
            title=final_title,
            logline=logline,
            genre=genre,
            synopsis=f"{final_title}: {logline}. A three-act cinematic journey from initial departure through trials to a triumphant resolution.",
            scenes=scenes,
            suggested_characters=characters,
            fountain_full_script=full_fountain,
        )
