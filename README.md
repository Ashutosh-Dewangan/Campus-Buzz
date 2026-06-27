Campus Buzz 📡
Campus Buzz is a real-time, interactive community platform designed for campus students, club members, and administrators to coordinate news, activities, event calendars, and safety-auditable anonymous complaints.


🚀 Features
1. Buzz Feed (Time-Sensitive Splits & Resell)
Time-Sensitive Expiry: Split requests (e.g., #foodsplit and #cabsplit) run real-time countdown timers. Timers turn red and pulse when under 5 minutes remain.
Expiry Extension: Authors can extend their split countdowns by 30 minutes.
Active Chat Badges: Post cards automatically display a pulsing badge showing the number of active messages in their real-time chat rooms.
2. Club Board (🏛️ Club Announcements)
Club members and Admins can publish announcements, link to Google Forms, and tie announcements to Calendar Event IDs.
Students can browse announcements, fill linked forms, and navigate to the linked event.
3. Events Calendar
Visual calendar displaying scheduled campus events.
RSVP Tracking: Users can flag their attendance status as "Going" or "Interested" with live tally counts.
Google Calendar Export: One-click button to export events with title, timing, description, and venue dynamically synced.
4. Complaints Desk
Students can post complaints regarding campus facilities.
Anonymous Safety: Submissions are anonymized for students ("Filed by: Anonymous"), while Admins retain full visibility of the owner's email for official audit tracking.
5. Moderation & self-policing
Flagging system allowing students to report inappropriate posts. Posts receiving 3 or more reports are hidden from student feeds but remain flagged and reviewable for Admins.


🛠️ Technology Stack
Frontend: HTML5, Vanilla CSS, JavaScript, Socket.io-client.
Backend: Node.js, Express, Socket.io, In-memory shared database (data.js).
Additional tools: Git, GitHub


💻 Running Locally
Install Dependencies:

bash
npm install

Start the Backend Server:

bash
node BACKEND/server.js

The server runs on http://localhost:5000

Launch the Frontend:

Open FRONTEND/index.html in VS Code.
Right-click and choose Open with Live Server (runs on port 5500 / 3000)

🔑 Test Credentials
Log in using the following credentials:

Role	   Roll Number	Email
Student 1	25116083	student1@nitrr.ac.in
Student 2	22114091	student2@nitrr.ac.in
Club Member	24115078	club@nitrr.ac.in
Admin	    23118055	admin@nitrr.ac.in

📽️Demo Video
Google drive link: https://drive.google.com/file/d/18zrl69BTV73Mle-EK9cFHx28A4wwjLMX/view?usp=drivesdk