import nodemailer from 'nodemailer';

export async function MailSender({data}){
    //Creating transport
    let sender=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"prakash2k2mech@gmail.com",
            pass:"whlbyhiuvifcgnvu"
        }
    });
    let reciever=data.email;
    let subject=data.subject;
    let message=data.message;
    let from={
        name:"Thirumana maalai Matrimony",
        address:"prakash2k2mech@gmail.com"
    }
    //mail content
    let mailContent={
        from:from,
        to:reciever,
        subject:subject,
        text:message,
    };
    sender.sendMail(mailContent,function(error,info){
        if(error){
            console.log("Error in sending mail",error);
            return false;
        }
    })
    return true;

}