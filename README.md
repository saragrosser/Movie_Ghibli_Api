# Studio Ghibli Web Application - API Guide

## Project Overview

The web application provides users with access to information about Studio Ghibli movies, directors, and genres. Users can sign up, update personal information, and create a list of their favorite movies.

---

## Getting Started

To run this API locally, follow the steps below.

---

## Prerequisites

Make sure the following are installed on your local machine:

- [Node.js](https://nodejs.org)
- [MongoDB](https://www.mongodb.com/try/download/community)

---

## Installation

1. **Clone the repository** to your local machine:

    ```bash
    git clone <repository-url>
    ```

2. **Navigate to the project directory:**

    ```bash
    cd <project-directory>
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

    _Refer to the `package.json` file for a full list of dependencies._

---

## Configuration

### Development

1. **Create a `.env` file** in the root directory.

2. **Add MongoDB environment variable**:

    ```env
    CONNECTION_URI=""
    ```

3. **Add Express.js environment variable**:

    ```env
    PORT=8080
    ```

---

### Production

Add your actual MongoDB URI to your cloud application's connection settings and use it in your `.env` file:

```env
CONNECTION_URI="your-production-uri"
