const express = require(`express`);
const path = require(`path`);
const mongoose = require(`mongoose`);
const postRoute = require(`./routes/post`);
const userRoute = require(`./routes/user`);

const bodyParser = require(`body-parser`);

const app = express();

/**UPDATE DB_DETAILS_COMES_HERE with MONGO DB Credentails */
mongoose
  .connect(`DB_DETAILS_COMES_HERE`)
  .then(() => {
    console.log(`Connection established !!!`);
  })
  .catch(() => {
    console.log(`Connection Failed`);
  });

app.use(bodyParser.json());
app.use(`/images`, express.static(path.join(`backend/images`)));

app.use((req, res, next) => {
  res.setHeader(`Access-Control-Allow-Origin`, `*`);
  res.setHeader(
    `Access-Control-Allow-Headers`,
    `Origin, Content-Type, Accept, Authorization`
  );
  res.setHeader(`Access-Control-Allow-Methods`, `GET, POST, DELETE, PUT`);
  next();
});

app.use(postRoute);
app.use(userRoute);

module.exports = app;
