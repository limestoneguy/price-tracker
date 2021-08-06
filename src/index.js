const axios = require("axios");
const jsdom = require("jsdom");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { JSDOM } = jsdom;

async function getLaptopPrice() {
  const html = await axios.get("https://dl.flipkart.com/s/WsYfV7NNNN");
  const dom = new JSDOM(html.data);

  return dom.window.document.querySelector("._30jeq3") || "Not Found";
}

cron.schedule("0 0 * * * *", example);
    
async function example() {
  const priceHTMLElement = await getLaptopPrice();
  if (priceHTMLElement.textContent) {
    const price = priceHTMLElement.textContent
      .replace(/₹/g, "")
      .replace(/,/g, "");

    try {
      const floatPrice = parseFloat(price);
      floatPrice < 99990
        ? sendMail(floatPrice)
        : console.log("Price didn't drop");
    } catch (error) {
      //Send Error Email
      console.log("Error Occured");
      sendErrorMail(error);
    }
  } else {
    sendErrorMail(priceHTMLElement);
  }
}

async function sendMail(latestPrice) {
  let info = await getTranportDetails().sendMail({
    from: '"Price Tracker"', // sender address
    to: process.env.RECIEVERS, // list of receivers
    subject: "Laptop Price Dropped", // Subject line
    text: "Congratulations Laptop Price is dropped", // plain text body
    html: `<b>new Price is</b> \n <h1>${latestPrice}</h1>`, // html body
  });
}

async function sendErrorMail(error) {
  let info = await getTranportDetails().sendMail({
    from: '"Price Tracker"', // sender address
    to: process.env.RECIEVERS, // list of receivers
    subject: "Error Occured", // Subject line
    text: "There is some Error in Price Tracker", // plain text body
    html: `<b>Error is</b> \n <h1>${error.toString()}</h1>`, // html body
  });
}

function getTranportDetails() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
}
