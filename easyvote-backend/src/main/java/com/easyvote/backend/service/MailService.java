package com.easyvote.backend.service;

import com.easyvote.backend.exception.BusinessException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${easyvote.app.name:EasyVote}")
    private String appName;

    @Value("${easyvote.app.url:http://localhost:5173}")
    private String appUrl;

    // ── OTP Email ─────────────────────────────────────────────

    public void sendOtpEmail(String toEmail, String fullName, String otpCode) {
        String subject = "EasyVote - Votre code de vérification : " + otpCode;
        String htmlBody = buildOtpEmailBody(fullName, otpCode);

        sendHtmlEmail(toEmail, subject, htmlBody);
        log.info("OTP email sent successfully to {}", toEmail);
    }

    // ── Welcome Email ─────────────────────────────────────────

    public void sendWelcomeEmail(String toEmail, String fullName) {
        String subject = "Bienvenue sur EasyVote \uD83C\uDF89";
        String htmlBody = buildWelcomeEmailBody(fullName);

        sendHtmlEmail(toEmail, subject, htmlBody);
        log.info("Welcome email sent successfully to {}", toEmail);
    }

    // ── Private: Send HTML Email ──────────────────────────────

    private void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("noreply@easyvote.com");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            throw new BusinessException("Erreur lors de l'envoi de l'email");
        }
    }

    // ── Private: OTP Email Template ───────────────────────────

    private String buildOtpEmailBody(String fullName, String otpCode) {
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head><meta charset="UTF-8"></head>
                <body style="margin:0; padding:0; background-color:#f5f5f5; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6); padding:32px 40px; text-align:center;">
                              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:-0.5px;">🗳️ EasyVote</h1>
                              <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">Plateforme d'élections universitaires</p>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:40px;">
                              <h2 style="margin:0 0 8px; color:#1f2937; font-size:20px;">Bonjour %s 👋</h2>
                              <p style="margin:0 0 24px; color:#6b7280; font-size:15px; line-height:1.6;">
                                Merci de vous être inscrit sur EasyVote. Pour activer votre compte, veuillez entrer le code de vérification ci-dessous :
                              </p>
                              <!-- OTP Code -->
                              <div style="text-align:center; margin:32px 0;">
                                <div style="display:inline-block; background:#f3f4f6; border:2px dashed #6366f1; border-radius:12px; padding:20px 40px;">
                                  <span style="font-size:36px; font-weight:800; letter-spacing:8px; color:#6366f1; font-family:'Courier New',monospace;">%s</span>
                                </div>
                              </div>
                              <p style="margin:0 0 8px; color:#ef4444; font-size:13px; text-align:center; font-weight:600;">
                                ⏱️ Ce code expire dans 10 minutes
                              </p>
                              <p style="margin:24px 0 0; color:#9ca3af; font-size:13px; line-height:1.5;">
                                Si vous n'avez pas créé de compte, ignorez simplement cet email.
                              </p>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background:#f9fafb; padding:20px 40px; border-top:1px solid #f3f4f6; text-align:center;">
                              <p style="margin:0; color:#9ca3af; font-size:12px;">
                                © 2026 EasyVote — Élections universitaires sécurisées
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(fullName, otpCode);
    }

    // ── Private: Welcome Email Template ───────────────────────

    private String buildWelcomeEmailBody(String fullName) {
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head><meta charset="UTF-8"></head>
                <body style="margin:0; padding:0; background-color:#f5f5f5; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#10b981,#059669); padding:32px 40px; text-align:center;">
                              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">🎉 Bienvenue !</h1>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:40px;">
                              <h2 style="margin:0 0 8px; color:#1f2937; font-size:20px;">Bonjour %s 👋</h2>
                              <p style="margin:0 0 16px; color:#6b7280; font-size:15px; line-height:1.6;">
                                Votre compte EasyVote a été vérifié avec succès ! Vous pouvez maintenant :
                              </p>
                              <ul style="color:#4b5563; font-size:14px; line-height:2; padding-left:20px;">
                                <li>🗳️ Participer aux élections universitaires</li>
                                <li>📋 Consulter les programmes des candidats</li>
                                <li>💬 Poser des questions aux candidats</li>
                                <li>🔔 Recevoir des notifications en temps réel</li>
                              </ul>
                              <div style="text-align:center; margin:32px 0 0;">
                                <a href="%s" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#ffffff; text-decoration:none; padding:14px 36px; border-radius:8px; font-size:15px; font-weight:600;">
                                  Accéder à EasyVote →
                                </a>
                              </div>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background:#f9fafb; padding:20px 40px; border-top:1px solid #f3f4f6; text-align:center;">
                              <p style="margin:0; color:#9ca3af; font-size:12px;">
                                © 2026 EasyVote — Élections universitaires sécurisées
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(fullName, appUrl);
    }
}
