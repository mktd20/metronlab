// Email service for sending reports
// This is a placeholder implementation - in production, use a service like SendGrid, Resend, or AWS SES

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
	// Placeholder implementation
	// In production, integrate with an email service provider
	
	console.log('📧 Email would be sent:', {
		to: options.to,
		subject: options.subject,
		preview: options.html.substring(0, 100) + '...'
	});

	// Example integration with a service like Resend:
	// const resend = new Resend(process.env.RESEND_API_KEY);
	// await resend.emails.send({
	//   from: 'MetronLab <noreply@metronlab.com>',
	//   to: options.to,
	//   subject: options.subject,
	//   html: options.html,
	//   text: options.text
	// });
}

export function generateReportEmail(
	userName: string,
	reportType: 'weekly' | 'monthly',
	report: {
		summary: string;
		strengths: string[];
		weaknesses: string[];
		improvements: string[];
		recommendations: string[];
	},
	summary: {
		totalMinutes: number;
		totalSessions: number;
		avgBpm: number;
		avgCompletionRate: number;
	}
): EmailOptions {
	const period = reportType === 'weekly' ? '주간' : '월간';
	const subject = `MetronLab ${period} 연습 리포트`;

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6C5CE7 0%, #5A4BD6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .stat { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #6C5CE7; }
    .section { margin: 20px 0; }
    .badge { display: inline-block; padding: 5px 10px; border-radius: 5px; font-size: 12px; margin: 5px 5px 5px 0; }
    .strength { background: #00B894; color: white; }
    .weakness { background: #FD79A8; color: white; }
    .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎵 MetronLab ${period} 리포트</h1>
      <p>안녕하세요, ${userName}님!</p>
    </div>
    <div class="content">
      <div class="section">
        <h2>📊 이번 ${period} 요약</h2>
        <div class="stat">
          <strong>총 연습 시간:</strong> ${Math.round(summary.totalMinutes)}분
        </div>
        <div class="stat">
          <strong>연습 세션:</strong> ${summary.totalSessions}회
        </div>
        <div class="stat">
          <strong>평균 BPM:</strong> ${summary.avgBpm}
        </div>
        <div class="stat">
          <strong>완주율:</strong> ${Math.round(summary.avgCompletionRate * 100)}%
        </div>
      </div>

      <div class="section">
        <h2>💪 강점</h2>
        <p>${report.summary}</p>
        ${report.strengths.map(s => `<span class="badge strength">${s}</span>`).join('')}
      </div>

      ${report.weaknesses.length > 0 ? `
      <div class="section">
        <h2>🎯 개선 영역</h2>
        ${report.weaknesses.map(w => `<span class="badge weakness">${w}</span>`).join('')}
      </div>
      ` : ''}

      ${report.improvements.length > 0 ? `
      <div class="section">
        <h2>📈 향상된 부분</h2>
        <ul>
          ${report.improvements.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <div class="section">
        <h2>💡 추천 사항</h2>
        <ul>
          ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div class="footer">
        <p>MetronLab에서 더 많은 연습을 시작해보세요!</p>
        <p><a href="https://metronlab.com/dashboard">대시보드로 이동</a></p>
      </div>
    </div>
  </div>
</body>
</html>
	`;

	const text = `
MetronLab ${period} 연습 리포트

안녕하세요, ${userName}님!

이번 ${period} 요약:
- 총 연습 시간: ${Math.round(summary.totalMinutes)}분
- 연습 세션: ${summary.totalSessions}회
- 평균 BPM: ${summary.avgBpm}
- 완주율: ${Math.round(summary.avgCompletionRate * 100)}%

${report.summary}

강점: ${report.strengths.join(', ')}
${report.weaknesses.length > 0 ? `개선 영역: ${report.weaknesses.join(', ')}` : ''}

추천 사항:
${report.recommendations.map(r => `- ${r}`).join('\n')}

대시보드에서 더 자세한 내용을 확인하세요: https://metronlab.com/dashboard
	`;

	return {
		to: '', // Will be set by caller
		subject,
		html,
		text
	};
}
