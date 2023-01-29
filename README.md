
# Joblink Node JS Server

It is a backend server for joblink web application. It is an app where user can register as employee or employers and post or apply for a job. It is just my personal side project which I created for fun and to demo a simple CURD application. I have used MongoDB atlas for my database and Node JS to write REST API's.


## Demo
link: https://joblink-frontend.vercel.app


## API Reference

https://jolink-backend-production.up.railway.app/doc.html


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`

`MONGO_URI`

`JWT_SECRET`

`SENDGRID_API_KEY`

`SENDGRID_HOST`

`SENDGRID_PORT`

`SENDGRID_USER`

`EMAIL_FROM_NAME`

`EMAIL_FROM_ID`

`CLOUD_NAME`

`CLOUD_API_KEY`

`CLOUD_API_SECRET`

`TEST_USER_ID`

`TEST_EMPLOYER_ID`

`FRONT_END_ORIGIN`
## Run Locally

Clone the project

```bash
  git clone https://github.com/AbhishekKolge/Jolink-backend.git
```

Go to the project directory

```bash
  cd joblink-backend
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

