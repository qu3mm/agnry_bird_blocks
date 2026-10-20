

### **UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES** 

Alubijid | Balubal | Cagayan de Oro | Claveria | Jasaan | Oroquieta | Panaon | Villanueva 

**Main Campus - Alubijid DEPARTMENT OF COMPUTER SCIENCE** 

# ‘S 

## **Emotional Engagement During Gameplay of an Educational Game:** 

**An Affective Computing, User Modeling, and Data Mining Approach Using Code.org Hour of Code Puzzles** 

Submitted in partial fulfillment of the requirements of **CS413.2 Affective Computing** 

Submitted to: 

Jonal C. Roble JR. 

by: MAGDUGO, Quem Krister D AMABA, ARA CHRISTEL N GANDAWALI, Johari B SALVADOR, Philip V ROXAS, Celestial Diane R 

October 2026 

##### **TABLE OF CONTENTS** 

|CHAPTER I INTRODUCTION ...................................................................................................................... 1|
|---|
|1.1.  Overview of the Experiment .............................................................................................................. 1|
|1.2.  Rationale ........................................................................................................................................... 2|
|1.3.  Objectives ......................................................................................................................................... 3|
|1.4.  Scope and Delimitations ................................................................................................................... 3|
|CHAPTER II METHODOLOGY..................................................................................................................... 4|
|2.1.  Experiment Design ............................................................................................................................ 4|
|2.1.1.  Participants ................................................................................................................................ 4|
|2.1.2.  Tools and Materials .................................................................................................................... 4|
|2.1.3.  Pre-Experiment Planning ........................................................................................................... 5|
|2.2.  Procedure and Script Requirements ................................................................................................. 6|
|Phase 1. Welcome and consent ........................................................................................................... 7|
|Phase 2. Pre-test .................................................................................................................................. 7|
|Phase 3. Orientation ............................................................................................................................. 7|
|Phase 4. Gameplay ............................................................................................................................... 8|
|Phase 5. Post-test ................................................................................................................................. 8|
|Phase 6. Debrief ................................................................................................................................... 8|
|2.3.  Data Collection .................................................................................................................................. 8|
|2.3.1.  Pre-Test Survey ......................................................................................................................... 9|
|2.3.2.  In-Game Check-In Survey.......................................................................................................... 9|
|2.3.3.  Post-Test Survey ........................................................................................................................ 9|
|2.3.4.  Video and Screen Recordings ................................................................................................... 9|
|2.3.5.  Expected Data Volume ............................................................................................................ 10|
|2.4.  Data Analysis .................................................................................................................................. 10|
|2.4.1.  Affective Computing: Facial Emotion Analysis ........................................................................ 10|
|2.4.2.  Behavioral Indicators from Screen Recordings........................................................................ 11|
|2.4.3.  Building the Analysis Dataset .................................................................................................. 11|
|2.4.4.  Comparing Facial Labels with Self-Reports ............................................................................. 11|
|2.4.5.  User Modeling .......................................................................................................................... 12|
|2.4.6.  Data Mining .............................................................................................................................. 12|
|2.4.7.  Interpretation Through the Challenge-Skill Balance ................................................................ 12|
|2.5.  Ethical Considerations and Limitations ........................................................................................... 13|
|REFERENCES ............................................................................................................................................ 14|
|APPENDICES ............................................................................................................................................. 15|
|Appendix A. Informed Consent Form ...................................................................................................... 15|
|Appendix B. Survey Instruments ............................................................................................................. 15|
|Appendix C. Researcher Task Log (one per participant) ........................................................................ 16|



ii 

#### **CHAPTER I INTRODUCTION** 

###### **1.1.  Overview of the Experiment** 

This experiment studies how people feel while playing an educational game, and how those feelings follow the difficulty of what they are doing. Participants will solve block-coding puzzles from the Code.org Hour of Code while a webcam and a screen recorder capture their faces and their on-screen actions. Three techniques will be combined. Affective computing will estimate emotions from facial expressions. User modeling will assemble each player’s emotional history into an individual profile. Data mining will search the pooled data for patterns that connect emotion, task difficulty, player skill, and in-game behavior. 

The study is organized around Flow Theory and its Challenge-Skill Balance principle (Csikszentmihalyi, 1990). According to the theory, absorbed and enjoyable engagement occurs when what a task demands is in step with what the person can do. Demands that outrun ability tend to produce anxiety or frustration, while demands that fall well short of ability tend to produce boredom (Nakamura & Csikszentmihalyi, 2002). We therefore expect players’ emotions to shift as they move from easy to harder puzzles, and to differ between beginners and experienced programmers who face the same puzzle. 

The educational game is the Hour of Code puzzle series from Code.org, a free collection of short coding activities that run in a web browser and are aimed at beginners (Code.org, n.d.). Players snap together visual blocks to guide a character through each puzzle, practicing sequencing, loops, and conditions without having to recall any programming syntax. The activity needs no account and is played with a mouse, which makes it easy to run with several participants and keeps each player’s face turned toward the screen. 

Affective computing refers to technology that detects, interprets, or responds to human emotion (Picard, 1997). Here the technology is facial emotion recognition. Building on the work of Ekman and Friesen (1971), such tools sort an expression into a small set of basic categories (neutral, happy, surprise, sad, angry, fear, and disgust), and open-source libraries such as DeepFace make this practical for student projects (Serengil & Ozpinar, 2020, 2021). A face does not always reveal what a person feels (Barrett et al., 2019), so every facial label in this study will be checked against what players say about their own feelings. 

1 

Earlier research shows why these questions matter for game-based learning. Learners drift through engagement, confusion, frustration, and boredom as they work (D’Mello & Graesser, 2012), and games that are perceived as suitably challenging are linked with stronger engagement and flow (Hamari et al., 2016). 

###### **1.2.  Rationale** 

A game cannot teach someone who has stopped caring about it, and whether a learner stays engaged depends heavily on the feelings the game stirs up. Yet most evaluations of educational games collect opinions only after play has ended, which hides when and where feelings changed. Looking at emotion during play can show designers which parts of a game frustrate, bore, or reward their players. 

Facial emotion recognition offers a way to follow feelings throughout a session without stopping the game. By pairing a face image from each minute with the puzzle on screen, the study can tie an emotional state to a specific task. User modeling then turns these observations into a record for each player, showing how that person’s emotional state moved through the session and how it related to the tasks faced. Because the study produces a mix of images, ratings, and behavior records, data mining is needed to look for regularities across players, such as when frustration tends to appear, how emotions differ by difficulty tier, and how patterns differ by skill level. 

Code.org’s puzzles were chosen because they are free, run in a browser, and rise in difficulty in steps that can be grouped into tiers. Block-based programming also separates the difficulty of the logic from the difficulty of language syntax, so the challenge being measured is problem solving rather than typing skill. 

The theory shapes the whole design. It is the reason task difficulty and perceived skill are recorded at every check-in, why puzzles are grouped by difficulty, and why the results will be read by asking whether feelings follow the match or mismatch between challenge and skill. The findings are expected to help educators and game designers see where learners are likely to struggle or lose interest, and to add to research on affective computing by comparing automated facial labels with learners’ own reports in a gamified setting. 

2 

###### **1.3.  Objectives** 

**General objective.** To find out how players’ feelings change with the difficulty of the task and with their own skill while they solve Code.org Hour of Code puzzles, and to judge whether these changes are consistent with Flow Theory. 

**Specific objectives.** The study aims to: 

1. estimate players’ emotions from facial images taken at regular intervals during play; 

2. gather players’ own ratings of their feelings, of puzzle challenge, and of their skill at regular intervals; 

3. construct an emotional profile for every participant through user modeling; 

4. link emotions to individual puzzles, difficulty tiers, and measurable behavior recorded from the screen; 

5. use data mining to uncover patterns connecting emotion, difficulty, skill, and behavior; and 

6. interpret the findings in terms of the Challenge-Skill Balance and draw implications for designing engaging educational games. 

###### **Research questions and hypotheses.** 

|**No.**|**Statement**|
|---|---|
|RQ1|Do frustration- and stress-related emotions become more frequent as puzzles get harder?|
|RQ2|How closely do emotions read from the face match what players report feeling?|
|RQ3|Do players with different levels of programming experience show different emotional<br>patterns on the same puzzles?|
|H1|Harder puzzles will show a higher share of frustration/stress-related facial labels and self-<br>reports than easier puzzles.|
|H2|Check-in windows in which a player rates the challenge above their confidence will show<br>more frustration/stress-related emotion, and windows in which confidence is rated above the<br>challenge will show more neutral states.|
|H3|Facial labels and self-reports will show at least fair agreement (Cohen’s kappa above 0.20).|



###### **1.4.  Scope and Delimitations** 

The study uses a small convenience sample of computing students, each observed in a single 35-minute session. It covers only the Code.org puzzles selected for the experiment and does not measure learning outcomes or test scores. The emotions examined are limited to those the facial analysis library can output and those offered in the surveys. The results describe this group of participants and should not be generalized to all learners or all educational games. 

3 

#### **CHAPTER II METHODOLOGY** 

###### **2.1.  Experiment Design** 

###### **_2.1.1.  Participants_** 

###### **_Number of participants_** 

At least 15 participants will take part. Recruiting up to 18 will protect the study against recordings that turn out to be unusable. All participants will be students of  Computer Science (BSCS1) at USTP Alubijid. 

###### **_Selection criteria_** 

Eligible students are 18 years or older and are studying, or have studied, a computing discipline such as Computer Science, Engineering, or Cybersecurity. The group will try to include a spread of prior programming experience, aiming for roughly equal numbers of beginners, intermediates, and advanced programmers as judged by the participants themselves in the pretest. Experience is used for comparison afterward and not for selection: every participant plays the same puzzles in the same order. 

###### **_Recruitment and consent_** 

Invitations will go out through class announcements, group chats, and in-person outreach. Each volunteer will read and sign the Informed Consent Form (Appendix A) before any recording starts. The form describes what is recorded, who may see it, how long it is kept, and how to withdraw. After consent, participants are referred to only by a code (P01, P02, and so on). Names appear on the consent forms alone, which are stored apart from the data. 

###### **_2.1.2.  Tools and Materials_** 

|**Tool**|**Role in the study**|
|---|---|
|Code.org Hour of Code<br>puzzles|The educational game: free, browser-based block-coding puzzles that<br>rise in difficulty. Entry point:https://studio.code.org/hoc/1|
|OBS Studio|Captures one combined video per session showing the screen and the<br>webcam view of the participant.|
|Phone countdown timer|Repeats every 5 minutes to cue each check-in survey.|
|Google Forms|Hosts the pre-test, the check-in survey, and the post-test.|
|Python with OpenCV|Pulls one still image of the face from the recording for every minute of<br>play.|
|DeepFace (Python library)|Reads each still image and returns the most likely facial emotion.|



4 

|**Tool**|**Role in the study**|
|---|---|
|pandas, scikit-learn,<br>matplotlib, and a|Cleaning and merging data, statistical tests, clustering, decision trees,<br>and charts.|
|spreadsheet||



_Table 1. Tools and materials_ 

###### **_Puzzle order and difficulty tiers_** 

Every participant will work through the same puzzles in the same fixed order, without skipping ahead. The puzzles are grouped into three tiers of difficulty. Since players advance at different speeds, the tier for each minute of play will be read from the screen recording. The final puzzle ranges will be set after a pilot run in which the research team times each puzzle and notes which ones draw many retries or long pauses. 

|**Tier**|**Proposed puzzles**|**Concepts involved**|**How the tier is judged**<br>**(confirm in pilot)**|
|---|---|---|---|
|Easy (E)|puzzles 1–5|Sequencing and simple turns|Solved fast|
|Medium<br>(M)|puzzles 6–13|Repeat loops|A few retries; 2 to 4<br>minutes|
|Hard (H)|puzzles 14–20|Nested loops and if/then<br>conditions|Many retries or long<br>pauses|



_Table 2. Proposed difficulty tiers_ 

A participant who finishes every assigned puzzle early will continue with the next puzzle in the fixed list, and this will be noted in the task log. 

###### **_2.1.3.  Pre-Experiment Planning_** 

The following preparations will be completed and checked before the first participant arrives: 

|**Item**|**Preparation**|
|---|---|
|Game|Open the chosen Code.org activity on every computer, confirm it loads,<br>check that the puzzle order matches Table 2, and make sound and display<br>settings the same on all machines.|
|Recording|Install OBS Studio, build a scene showing screen and webcam together,<br>check lighting and camera angle, and set the file name to the Participant ID.<br>Reserve roughly 1 GB of storage per participant.|
|Timer|Set a repeating 5-minute countdown on a phone, and a separate 35-minute<br>session countdown|
|Surveys|Build the pre-test, check-in, and post-test forms in Google Forms (Appendix<br>B), and test that each response is saved with the Participant ID.|
|Consent and IDs|Print consent forms, prepare Participant ID cards, and arrange separate<br>storage for signed forms.|



5 

|**Item**|**Preparation**|
|---|---|
|Observation|Prepare one Task Log sheet per participant (Appendix C), and assign team<br>roles (Table 4).|
|Pilot run|One team member completes the full 35-minute procedure. The recording is<br>passed through frame extraction and DeepFace to confirm that a face is<br>found, the timing works, and the tiers are sensible.|



_Table 3. Pre-experiment preparation checklist_ 

###### **2.2.  Procedure and Script Requirements** 

A session takes about 50 minutes per participant. Sessions may be run one participant at a time or in small groups, provided each participant has a separate computer and webcam. 

|**Phase**|**What happens**|**Time**|
|---|---|---|
|1. Welcome and consent|Introduction to the study and signing of the consent form|5 min|
|2. Pre-test|Background and starting mood form|3 min|
|3. Orientation|Quick tour of the puzzle controls|3 min|
|4. Gameplay|Recorded play with a check-in every 5 minutes|35 min|
|5. Post-test|Final form|3 min|
|6. Debrief|Thanks, explanation of data use, questions|2 min|



_Table 3a. Session timeline (about 46 minutes in total)_ 

|**Team role**|**Responsibility**|
|---|---|
|Facilitator|Delivers the scripts, answers questions, and keeps the session on schedule.|
|Technical operator|Starts and monitors the recording and checks that the face is visible.|
|Timekeeper|Runs the countdowns and cues each check-in.|
|Observer|Completes the task log from the screen recording after the session.|



6 

_Table 4. Roles of the research team_ 

###### **_Phase 1. Welcome and consent_** 

The facilitator greets the participant, explains the study in plain terms, and obtains a signed consent form before anything is recorded. 

###### **FACILITATOR SCRIPT** 

“Hello, and thanks for coming. I am Celestial Diane R. Roxas, and together with my groupmates Quem Krister D. Magdugo, Ara Christel N. Amaba, Johari B. Gandawali, and Philip V. Salvador, we are Computer Science students carrying out a class research project. Over the next 45 minutes you will solve a series of block-coding puzzles. While you play, we will record your screen and your webcam so we can study how people’s feelings change as puzzles get harder. We are not testing your ability or grading how well you do, so there is no right or wrong way to play.” 

“Here is the consent form. It spells out what we record, who can see it, and when it is deleted. Please take your time. You can say no, and you can stop at any moment without giving a reason. If you are happy to continue, sign it and I will give you your ID card. Do you have any questions?” 

###### **_Phase 2. Pre-test_** 

Each participant receives an ID card and completes the pre-test form (Appendix B1), which records background, starting mood, and expectations. No names or email addresses are entered. 

###### **FACILITATOR SCRIPT** 

“Your card shows a code such as P07. Please use that code, not your name, on every form today. First, a short form about your coding background and how you feel right now. There are no right answers; it simply gives us a starting point.” 

###### **_Phase 3. Orientation_** 

The facilitator demonstrates the controls only and does not solve any puzzle that will be used in the session. 

###### **FACILITATOR SCRIPT** 

“These puzzles use colored blocks instead of typed code. Drag blocks into the workspace to build your instructions, press Run to test them, and use Reset to start over. Please go through the puzzles in order and do not skip ahead. Some will be quick and some may take a while, and both are fine. Keep your face toward the screen and play the way you normally would.” 

7 

###### **_Phase 4. Gameplay_** 

The technical operator starts the recording, and the timekeeper starts both countdowns. The participant plays for 30 minutes. At minutes 5, 10, 15, 20, 25, and 30, the timekeeper cues a check-in. Participants are given one minute to answer each check-in form in a second browser tab while the recording continues. The screen recording captures the puzzle on the screen and every action. After the session, the researchers will count the attempts, resets, and idle time for each minute from the recording (Appendix C). 

###### **FACILITATOR SCRIPT** 

“When the timer sounds, I will say ‘check-in.’ Switch to the survey tab, answer three quick questions about your feelings, the puzzle, and your confidence, then go straight back to the game. Recording has started. You may begin.” 

###### **_Phase 5. Post-test_** 

When the 30 minutes are up, the recording is stopped and the participant completes the post-test form (Appendix B3). 

###### **_Phase 6. Debrief_** 

The facilitator thanks the participant, explains what happens to the data, and invites questions. 

The operator saves the recording under the Participant ID in the secure storage location. 

###### **FACILITATOR SCRIPT** 

"That is the end of the session, and thank you so much for your time and participation! You helped us see how the difficulty of a task relates to how players feel, which can help make learning games more engaging. As a token of our appreciation for completing the experiment today, we would like to present you with this Certificate of Participation." 

"Here is what happens next with your data. Only our group and our instructor will see the raw recordings. Your results will appear in our report under your participant ID, never your name. Videos and face images will be deleted by December 30, 2026. If you want your data removed, contact reactl3@ <mark>p</mark> rotonmail.com before November 20, 2026. Do <mark>y</mark> ou have an <mark>y q</mark> uestions?" 

###### **2.3.  Data Collection** 

Data will be gathered in three survey stages and from recordings. The survey instruments are given in Appendix B. 

8 

###### **_2.3.1.  Pre-Test Survey_** 

Before play, each participant will provide: 

- **Background:** self-rated programming skill (1 to 5) and declared level (beginner, intermediate, advanced), weekly hours spent coding, and any previous use of blockcoding games. 

- **Starting mood:** two ratings on 5-point scales, one for how pleasant or unpleasant the participant feels and one for how calm or energized, following the valence and arousal dimensions of Russell (1980). 

- **Expectations:** confidence in solving a puzzle never seen before (1 to 5) and expected difficulty of the session (1 to 5). 

###### **_2.3.2.  In-Game Check-In Survey_** 

Every 5 minutes, five times per participant, a three-item check-in will be answered: 

- **Emotion word:** the word that best fits the feeling at this moment, chosen from the seven categories the facial library also uses, so the two sources can be compared directly. Each word is also grouped into the study categories in Table 6 to give the self-reported state. 

- **Challenge:** how difficult the current task is, from 1 (very easy) to 5 (very difficult). 

- **Confidence:** how confident the participant is that they can complete the current task, from 1 (not confident at all) to 5 (very confident), used as a proxy for skill. 

Rating challenge and confidence separately follows the experience-sampling approach used in flow research (Csikszentmihalyi & Larson, 1987). A balance score, challenge minus confidence, will be calculated for each check-in. The puzzle number for each check-in is read from the screen recording. 

###### **_2.3.3.  Post-Test Survey_** 

After play, participants name the feeling they experienced most often, using the same seven categories as the check-in. They rate the overall difficulty of the activity, their confidence in solving similar puzzles, how well they think they performed, how engaged they were, and how comfortable they were with being recorded. They may also add comments. 

###### **_2.3.4.  Video and Screen Recordings_** 

OBS Studio will capture the whole session as one video. It supplies the face images for emotion analysis and the evidence for the task log and behavior counts. 

9 

###### **_2.3.5.  Expected Data Volume_** 

|**Data**|**Per participant**|**For 15 participants**|
|---|---|---|
|Pre-test responses|1|15|
|Check-in responses|6|90|
|Post-test responses|1|15|
|Face images (one per minute)|30|450|
|Task log rows (one per minute)|30|450|



_Table 5. Expected volume of data_ 

###### **2.4.  Data Analysis** 

The survey responses, face images, and screen recordings will be processed and merged into a single dataset with one row per participant per minute. 

###### **_2.4.1.  Affective Computing: Facial Emotion Analysis_** 

A short script will extract one still image from each minute of the webcam recording, giving 30 images per participant, and DeepFace will return the dominant emotion for each. Images in which no face is detected will be flagged and left out of the analysis. 

DeepFace has no output for “frustration” or “stress.” Its labels will therefore be grouped into the study categories shown in Table 6, so facial results are treated as indirect proxies for these states. This is acknowledged as a limitation. 

- Grouping “surprise” with positive emotions is an approximation, since surprise can be positive or negative. 

|**DeepFace label**|**Study category**|
|---|---|
|angry, sad, fear, disgust|Frustration / stress (proxy)|
|happy, surprise|Satisfaction / positive|
|neutral|Neutral (calm, concentrating, or possibly bored)|



_Table 6. Grouping of facial labels into study categories_ 

To gauge how well DeepFace performs on this particular group, two researchers will independently label a random sample of roughly 20% of the images (about 90 of 450) by looking at them. Disagreements will be settled by discussion, and agreement between the researchers, and between their agreed label and DeepFace, will be reported. 

10 

###### **_2.4.2.  Behavioral Indicators from Screen Recordings_** 

Reviewers will replay each screen recording and, for every minute, record the puzzle and tier and count the indicators in Table 7. Two researchers will code a shared sample to check that they count consistently. 

|**Indicator**|**How it is measured each minute**|**What it may suggest**|
|---|---|---|
|Attempts|Number of times Run is pressed|Trial-and-error effort; many attempts<br>without success point to difficulty|
|Resets|Number of times blocks are cleared or<br>the puzzle is reset|Abandoning a plan or confusion|
|Idle seconds|Seconds with no mouse or keyboard<br>activity|Thinking, being stuck, or drifting<br>attention|
|Puzzle solved|1 if a puzzle is completed in the<br>minute, otherwise 0|Progress and success|



_Table 7. Behavioral indicators coded from the screen recordings_ 

From these, a minute will be marked “stuck” if it contains three or more attempts and no solved puzzle, or at least 30 seconds of idle time. These thresholds will be calibrated during the pilot run. 

###### **_2.4.3.  Building the Analysis Dataset_** 

|**Group**|**Variables**|
|---|---|
|Identifiers|participant_id, minute (1 to 30), window (check-in block, 1 to 5)|
|Task context|puzzle, tier (E, M, H)|
|Facial data|face_emotion (DeepFace label), face_category (Table 6), face_detected (yes<br>or no)|
|Behavior|attempts, resets, idle_seconds, solved|
|Check-in (per window)|self_emotion, self_category, challenge (1 to 5), confidence (1 to 5), balance<br>(challenge minus confidence)|
|Participant level|declared skill level, pre-test mood ratings and post-test most frequent feeling|



_Table 8. Variables in the consolidated dataset_ 

###### **_2.4.4.  Comparing Facial Labels with Self-Reports_** 

Each check-in describes the five minutes before it. The five facial categories in that block will be reduced to one by majority vote and set against the participant’s self-reported state. Agreement will be reported as percent agreement and as Cohen’s kappa (Cohen, 1960), read against the benchmarks of Landis and Koch (1977). 

11 

###### **_2.4.5.  User Modeling_** 

For each participant, the minute-by-minute emotion categories, check-in answers, and behavior counts will be combined into an individual profile and drawn as a timeline. Each profile will state the share of time in each emotion category, how often the emotion changed, the dominant emotion within each tier, and the first puzzle at which signs of frustration appeared. 

###### **_2.4.6.  Data Mining_** 

The merged data will be explored with these techniques: 

- **Descriptive analysis:** emotion frequency by tier and by experience level, shown in charts. 

- **Statistical tests:** a Friedman test on each participant’s share of frustration/stress labels across the three tiers, and a Spearman correlation between rated challenge and that share, both suited to small samples. Participants who do not reach all three tiers within the 30 minutes will be left out of the Friedman test and described separately. 

- **Clustering:** k-means on participants’ emotion profiles to find types of players, choosing the number of clusters by silhouette score. 

- **Decision tree:** a shallow tree predicting frustration from tier, balance score, behavior counts, and experience level, yielding readable if-then rules. 

###### **_2.4.7.  Interpretation Through the Challenge-Skill Balance_** 

Results will be read against the predictions in Table 9, using the balance score from the check-ins. The balance score is the participant’s rating of task difficulty minus their rating of confidence in completing the task, and confidence is used as a self-reported proxy for skill. A balance of zero with both ratings at 4 or 5 marks the zone where flow is expected. A balance of zero with both ratings at 1 or 2 is read as apathy rather than flow, and a balance of zero with both ratings at 3 is not classified. Because the seven emotion labels cannot name boredom or satisfaction directly, these states are inferred from the label together with the Task Log. The predictions are treated as hypotheses, and the cutoffs were chosen by the researchers. 

|**Balance (challenge minus**<br>**confidence)**|**Predicted state**|**Expected evidence**|
|---|---|---|
|+1 or more (challenge above<br>skill)|Anxiety or<br>frustration|More frustration/stress labels; stuck minutes|
|0, both ratings 4 or 5|Flow or<br>engagement|More satisfaction/positive labels; steady progress|
|0, both ratings 1 or 2|Apathy|More neutral labels; few attempts and low progress|



12 

|**Balance (challenge minus**<br>**confidence)**|**Predicted state**|**Expected evidence**|
|---|---|---|
|0, both ratings 3|Not classified|Interpreted case by case|
|−1 or less (skill above<br>challenge)|Boredom|More neutral labels; quick solves and few attempts|



_Table 9. Predicted emotional states under the Challenge-Skill Balance_ 

###### **2.5.  Ethical Considerations and Limitations** 

**Ethical considerations.** Participation is voluntary, rests on written informed consent, and may be ended at any time. All data carry Participant IDs only; names and contact details exist only on consent forms, stored separately. Recordings are kept in a password-protected location open only to the research team and instructor, and video and face images will be permanently deleted on or before December 30, 2026. Face images will not appear in any report without separate written permission. The study will follow the research policies of USTP and applicable data privacy laws (Data Privacy Act of 2012). 

**Limitations.** The following limits should be kept in mind when reading the results: 

- 

   - A small convenience sample restricts how far the findings can be generalized. 

- A facial expression is only an indirect sign of emotion (Barrett et al., 2019). A neutral face may reflect concentration rather than boredom. 

- DeepFace can be less accurate with glasses, poor lighting, or a tilted head; images without a detectable face are excluded. 

- Code.org puzzles are designed for beginners, so experienced participants may find many of them easy, which limits the frustration that can be observed. Tiering the puzzles after a pilot and using the harder ones addresses this. 

- Check-in surveys interrupt play and may affect emotions, and participants may mask their expressions because they know they are being recorded. 

13 

##### **REFERENCES** 

- Barrett, L. F., Adolphs, R., Marsella, S., Martinez, A. M., & Pollak, S. D. (2019). Emotional expressions reconsidered: Challenges to inferring emotion from human facial movements. _Psychological Science in the Public Interest, 20_ (1), 1–68. 

- Code.org. (n.d.). _Hour of Code_ . https://hourofcode.com 

- Cohen, J. (1960). A coefficient of agreement for nominal scales. _Educational and Psychological Measurement, 20_ (1), 37–46. 

- Csikszentmihalyi, M. (1990). _Flow: The psychology of optimal experience_ . Harper & Row. 

- Csikszentmihalyi, M., & Larson, R. (1987). Validity and reliability of the experience-sampling method. _Journal of Nervous and Mental Disease, 175_ (9), 526–536. 

- D’Mello, S., & Graesser, A. (2012). Dynamics of affective states during complex learning. _Learning and Instruction, 22_ (2), 145–157. 

- Ekman, P., & Friesen, W. V. (1971). Constant across cultures in the face and emotion. _Journal of Personality and Social Psychology, 17_ (2), 124–129. 

- Hamari, J., Shernoff, D. J., Rowe, E., Coller, B., Asbell-Clarke, J., & Edwards, T. (2016). Challenging games help students learn: An empirical study on engagement, flow and immersion in game-based learning. _Computers in Human Behavior, 54_ , 170–179. 

- Landis, J. R., & Koch, G. G. (1977). The measurement of observer agreement for categorical data. _Biometrics, 33_ (1), 159–174. 

- Nakamura, J., & Csikszentmihalyi, M. (2002). The concept of flow. In C. R. Snyder & S. J. Lopez (Eds.), _Handbook of positive psychology_ (pp. 89–105). Oxford University Press. 

- Picard, R. W. (1997). _Affective computing_ . MIT Press. 

- Russell, J. A. (1980). A circumplex model of affect. _Journal of Personality and Social Psychology, 39_ (6), 1161–1178. 

- Serengil, S. I., & Ozpinar, A. (2020). LightFace: A hybrid deep face recognition framework. In _2020 Innovations in Intelligent Systems and Applications Conference (ASYU)_ (pp. 1–5). IEEE. 

- Serengil, S. I., & Ozpinar, A. (2021). HyperExtended LightFace: A facial attribute analysis framework. In _2021 International Conference on Engineering and Emerging Technologies (ICEET)_ (pp. 1–4). IEEE. 

14 

##### **APPENDICES** 

###### **Appendix A. Informed Consent Form** 

<u>https://drive.google.com/file/d/1gKad6FVUk7NOEbynZPNbrNRqMD3U-iP4/view?usp=sharing</u> 

Signed forms are stored separately from the research data and are not part of the submitted report. 

###### **Appendix B. Survey Instruments** 

###### **_B1. Pre-Test Form_** 

<u>https://forms.gle/aigHzmMVJ7mfpLN99</u> 

|**No.**|**Item**|**Response**|
|---|---|---|
|1|Participant ID|Text (e.g. P01, P02)|
|2|How would you rate your overall programming skill?|1 (very low) to 5 (very high)|
|3|Which programming experience level describes you<br>best?|Beginner / Intermediate / Advanced|
|4|Approximately how many hours per week do you spend<br>programming?|I do not currently program / Less<br>than 1 hour / 1–5 hours / 6–10<br>hours / More than 10 hours|
|5|How much experience do you have with block-based<br>coding?|No experience / Less than 1 month /<br>1–6 months / 7–12 months / More<br>than 1 year|
|6|Right now, how pleasant or unpleasant do you feel?|1 (very unpleasant) to 5 (very<br>pleasant)|
|7|Right now, how calm or energized do you feel?|1 (very calm) to 5 (very energized)|
|8|How confident are you that you could solve a puzzle you<br>have never seen before?|1 (not at all) to 5 (completely)|
|9|How difficult do you expect today’s puzzles to be?|1 (very easy) to 5 (very hard)|



###### **_B2. Check-In Form (every 5 minutes)_** 

<u>https://forms.gle/SKcuzwT71QBzrkfd8</u> 

|**No.**|**Item**|**Response**|
|---|---|---|
|1|Participant ID|Text|
|2|Check-in number|1 to 5|
|3|How are you feeling right now?|Happy / Sad / Angry / Fear /<br>Surprise / Disgust / Neutral|
|4|How difficult is the current task?|1 (very easy) to 5 (very difficult)|
|5|How confident are you that you can complete the<br>current task?|1 (not confident at all) to 5 (very<br>confident)|



15 

|**No.**|**Item**|**Response**|
|---|---|---|
|6|Wrap-Up Procedure|Thanks, Certificate presentation,<br>explanation of data use, questions|



###### **_B3. Post-Test Form_** 

<u>https://forms.gle/6z6wv5D1YXkFoGZs5</u> 

|**No.**|**Item**|**Response**|
|---|---|---|
|1|Participant ID|Text|
|2|Overall, which feeling did you experience most often<br>during the activity?|Happy / Sad / Angry / Fear /<br>Surprise / Disgust / Neutral|
|3|Overall, how difficult was the activity?|1 (very easy) to 5 (very difficult)|
|4|After this activity, how confident are you that you can<br>solve similar puzzles?|1 (not confident at all) to 5 (very<br>confident)|
|5|How well do you think you performed in the activity?|1 (very poorly) to 5 (very well)|
|6|How engaged or interested were you during the activity?|1 (not engaged at all) to 5 (very<br>engaged)|
|7|How comfortable were you with having your face and<br>screen recorded?|1 (very uncomfortable) to 5 (very<br>comfortable)|
|8|Any comments or suggestions? (optional)|Paragraph text|



###### **Appendix C. Researcher Task Log (one per participant)** 

<u>https://docs.google.com/spreadsheets/d/1gEyasCtUq6bpZu4yFp09xvw8YpZhtXdPQV7KNlQue4/edit?usp=sharing</u> 

|**Minute**|**Puzzle no.**|**Tier**|**Attempts**|**Resets**|**Idle (s)**|**Solved**<br>**(0/1)**|**Notes**|
|---|---|---|---|---|---|---|---|
|1||||||||
|2||||||||
|3||||||||
|…||||||||
|30||||||||



_Participant ID: ________   Date: ________   Observer: _________ 

16 

###### **Appendix D. Certificate of Participation Template** 

<u>https://canva.link/certification-of-participation-template</u> 



<!-- Start of picture text -->
USTIP \ <8<br>eS OF PARTICIPATION .<br>This certificate is proudly presented to 4<br>0<br>MieSs7) (ES Nite~ & Nave~<br>j For actively participating and contributing as a participant in the research<br>W experiment titled<br>Code.org Learning Environments”<br>i.) “Evaluating the Impact of Game Difficulty and Emotional Responses in<br>y9 Conductedon [DATE] at the University of Science and Technology of Southern<br>Philippines. 5<br>:<br>Name Name<br>Lead Researcher Faculty Advicer ‘<br><!-- End of picture text -->

17 

