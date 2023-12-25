const xlsx = require('xlsx');
const Participant = require('../model/certificateModel');
const config = require('../config/config');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const ejs = require('ejs');

const loadMain = async(req, res) => {
    try {
        const message = req.query.message || null;
        if (message == null){
            res.render('upload', {message : ""});
        }else{
            res.render('upload', {message : message});
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const extractData = async(req, res) => {
    try {
        if (!req.files || !req.files[0]) {
            throw new Error('No file uploaded.');
        }
        const data = req.files[0].buffer;
        const excelSheet = xlsx.read(data, {type: 'buffer'});
        const participantsData = excelSheet.SheetNames[0];
        let jsonData = xlsx.utils.sheet_to_json(excelSheet.Sheets[participantsData]);
        let tempStorage = jsonData;

        // console.log(jsonData);
        
        for (const participant of jsonData){
            const tempData = await Participant.find({Email : participant.Email});
                if (tempData.length > 0){
                    jsonData = jsonData.filter(existingParticipant => existingParticipant.Email !== participant.Email);
                }
        }
        // console.log(jsonData);
        await Participant.insertMany(jsonData);
        res.render('participants', {message : tempStorage});
        // res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}


const sendVerficationMail = async(name, user_id, email) => {
    try {
        
        const transporter = nodemailer.createTransport({
            host : 'smtp.gmail.com',
            port : 587,
            secure : false,
            requireTLS : true,
            auth : {
                user : config.email,
                pass : config.emailPassword,
            }
        })

        const mailOptions = {
            from : config.email,
            to : email,

            
            subject : 'Find your certificate',
            html : 'Hello '+name+', Please find your certificate <a href="http://localhost:3000/verify?id='+user_id+'">here</a>,               '
        }


        transporter.sendMail(mailOptions, (error, info) => {
            if (error){
                console.log(error.message);
            }else{
                console.log("Email has been sent ", info.response);
            }
        })


    } catch (error) {
        console.log(error.message);
    }
}

const certficateLoader = async(req, res) => {
    try {
        const userData = await Participant.findById({_id : req.query.id});
        // console.log(userData);
        const html = await ejs.renderFile('./views/certificate.ejs', {
            message: { Name: userData.Name, Type: userData.Type, Date: userData.Date },
        });
        const tempHtmlPath = './views/temp.html';
        fs.writeFileSync(tempHtmlPath, html);
        const browser = await puppeteer.launch();
        const page = await browser.newPage();


        await page.setViewport({ width: 1056, height: 816 });
        await page.setContent(html);
        const pdfOptions = {
            format: 'A4', 
            scale: 1, 
            displayHeaderFooter: false,
            printBackground: true, 
            margin: {top: '0px', right: '0px', bottom: '0px', left: '0px'},
            pageRanges: '1',
            height : 816,
            width : 1056
        };
        const pdfBuffer = await page.pdf(pdfOptions);
        await browser.close();

        fs.unlinkSync(tempHtmlPath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=certificate.pdf');
        res.status(200).send(pdfBuffer);
    } catch (error) {
        console.log(error.message);
    }
}


const sendEmails = async(req, res) => {
    try {
        const allParticipants = await Participant.find();
        if (allParticipants){
            console.log(allParticipants);
        }
        for (const part of allParticipants){
            await sendVerficationMail(part.Name, part._id, part.Email);
        }
        
        res.redirect('/?message=' + encodeURIComponent("Emails are sent to respective mails"));
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadMain,
    extractData,
    sendEmails,
    certficateLoader
}