
  # CampusKart
CampusKart – Your Campus, Your Marketplace is a campus-centric e-commerce platform designed to address the challenges faced by SRMIST students and staff when buying and selling goods within the institution. The project aims to provide a verified, secure, and easy-to-use online marketplace restricted to SRMIST members. Unlike public classifieds such as OLX or Quikr, which are open to scams, impersonation, and irrelevant listings, CampusKart leverages SRM-based authentication and role-based access to ensure only genuine members participate in transactions.

The platform’s architecture is based on a modern full-stack implementation using React for the frontend and Node.js or Supabase for the backend. PostgreSQL serves as the relational database, offering efficient management of listings, orders, users, and reviews. The system integrates key e-commerce functionalities such as product posting, editing, marking as sold, and admin moderation. Admins (faculty members) have complete oversight to verify users, monitor suspicious activity, and enforce guidelines.

User authentication relies on institutional email verification, ensuring that only legitimate SRM community members can create accounts. Every listing includes images, descriptions, price, and condition status. When a product is purchased, the backend updates inventory, creates an order record, and notifies both buyer and seller. Transactions remain within the SRMIST ecosystem, fostering trust and reliability.

CampusKart also emphasizes UI/UX design. The interface is responsive, built with Chakra UI for clean styling, and optimized for both web and mobile screens. Users experience real-time updates using React’s state management. The admin dashboard is separately designed for monitoring activities, reviewing flagged products, and generating analytics.

The project contributes to environmental sustainability by encouraging reuse of materials, promoting affordability among students, and strengthening campus connectivity. Security measures such as hashed passwords (bcrypt/Argon2), token-based authentication, and input sanitization guarantee data integrity. The system underwent unit and integration testing to ensure performance consistency under load.

Ultimately, CampusKart is more than a digital store — it’s an institutional ecosystem that empowers verified students and staff to transact confidently within SRMIST. This project demonstrates practical application of advanced programming principles, full-stack architecture, and human-centered design. Its scalability allows future integrations like mobile apps, chat features, and payment gateways, positioning it as a model campus marketplace for educational institutions across India.
  

  This is a code bundle for E-commerce Web App. 
  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
