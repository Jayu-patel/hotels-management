// @ts-ignore
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const {email, password, full_name, role, to, subject } = await req.json();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // must be service role key
    );

      const { data, error } = await supabase.auth.admin.createUser(
        { 
          email, 
          password,
          email_confirm: true
        },
      );
      if(!error){
          const {user} = data
          const { error: profileError } = await supabase.from("profiles").update({email, full_name, role}).eq("id", user?.id);
    
          if (profileError) throw profileError.message;
      }
      else{
        throw error.message
      }


    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Hotel Book" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <title>Welcome to HotelBook</title>
            </head>
            <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
                <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #ff4c5b; padding: 20px; color: #ffffff;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                            <tr>
                            <!-- Logo left -->
                            <td align="left" style="width: 60px;">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB1MsgHfEVSoj9C0RQCUAmo7PpcjDmcdTp7A&s" 
                                    alt="HotelBook Logo" width="50" style="display:block;">
                            </td>
                            <!-- Title center -->
                            <td align="center">
                                <h2 style="margin: 0; font-size: 24px; color: #ffffff;">Welcome to HotelBook</h2>
                            </td>
                            <!-- Empty cell for spacing -->
                            <td style="width: 60px;"></td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 20px; color: #333333;">
                        <p>Hi <strong>${full_name}</strong>,</p>
                        <p>An account has been created for you on <strong>HotelBook</strong>. Here are your login details:</p>
                        
                        <table cellpadding="5" cellspacing="0" style="margin: 10px 0; border: 1px solid #ddd; width: 100%; border-radius: 4px;">
                            <tr>
                            <td style="background-color: #f7f7f7; width: 120px;"><strong>Email:</strong></td>
                            <td>${email}</td>
                            </tr>
                            <tr>
                            <td style="background-color: #f7f7f7;"><strong>Password:</strong></td>
                            <td>${password}</td>
                            </tr>
                        </table>

                        <p>Please log in and change your password immediately for security purposes.</p>
                        <p>We’re excited to have you onboard and wish you a great experience!</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1e1e1e; color: #ffffff; text-align: center; padding: 20px;">
                        <p>
                            <a href="https://facebook.com" style="margin:0 5px; display:inline-block;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" alt="Facebook">
                            </a>
                            <a href="https://x.com" style="margin:0 5px; display:inline-block;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="24" alt="X">
                            </a>
                            <a href="https://linkedin.com" style="margin:0 5px; display:inline-block;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" width="24" alt="LinkedIn">
                            </a>
                        </p>
                        <p style="margin-top: 10px; font-size: 12px;">© 2025 HotelBook. All Rights Reserved.</p>
                        </td>
                    </tr>
                    
                    </table>
                </td>
                </tr>
            </table>
            </body>
            </html>

      `,
    });

    return NextResponse.json({ success: true }, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}