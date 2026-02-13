# 🚀 CodeLeap - Technical Challenge

Welcome to my submission for the **CodeLeap Frontend Challenge**. 

Although the original requirements focused primarily on frontend capabilities, I decided to push the boundaries and deliver a **full-stack social media application**. My goal was to demonstrate not only my React skills but also my ability to build integrated systems, manage databases, and handle server-side logic to create a seamless user experience.

You can find the welcome post titled **"Greetings!"** on the main feed at [https://blog-challenge-iota.vercel.app](https://blog-challenge-iota.vercel.app), which summarizes my journey during this week-long project.

---

## 🛠 Tech Stack

The application was built using a modern, scalable stack focused on performance and developer experience:

*   **Framework:** [Next.js](https://nextjs.org/) (React.js)
*   **Language:** TypeScript
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Deployment:** [Vercel](https://vercel.com/)
*   **API:** Next.js Serverless Functions (Server-side integration)

---

## ✨ Key Features

This platform functions as a generic social media/blogging environment. Key features include:

*   **User Authentication:** Complete registration system for new users.
*   **Dynamic Feed:** Create and publish posts with support for both text and image content.
*   **Social Interactions:** 
    *   **Follow System:** Visit other users' profiles and follow them.
    *   **Reactions:** React to posts to show engagement.
    *   **Comments:** Add comments to any publication to join the conversation.
*   **Personal Profile:** Dedicated profile pages including a **Personal Image Gallery** containing all images uploaded by the user.
*   **Responsive Design:** Optimized for various screen sizes, ensuring a smooth experience across devices.

---

## 🧠 Project Philosophy: Why Full-stack?

The core of this challenge was to evaluate frontend skills. However, to truly showcase my potential as a modern frontend developer, I leveraged **Next.js server-side functionalities**. 

By building an integrated API and connecting it to a **PostgreSQL** database via **Prisma ORM**, I was able to:
1.  Ensure data persistence (your posts won't disappear on refresh).
2.  Demonstrate knowledge of data modeling and relational databases.
3.  Showcase a "Front-end with strong Full-stack potential" mindset, capable of understanding the entire lifecycle of a web request.

---

## 🚀 Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-link]
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    # or
    yarn install
    ```
3.  **Environment Variables:**
    Create a `.env` file and add your PostgreSQL connection string:
    ```env
    DATABASE_URL="your-postgresql-connection-string"
    ```
4.  **Run Prisma migrations:**
    ```bash
    npx prisma migrate dev
    ```
5.  **Start the development server:**
    ```bash
    pnpm run dev
    ```

---

## 📝 Final Notes

As mentioned in my "Greetings!" post: 
> *"Feel free to explore the app, and hunt for any bugs — I'm sure I haven't quite managed to squish them all hehe."*

I am excited to discuss the technical decisions behind this project and how I can contribute to the **CodeLeap** team. Thank you for the opportunity!

--- 

Developed with ☕ and passion for the CodeLeap Technical Challenge.