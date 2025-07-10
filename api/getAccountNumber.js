const { google } = require('googleapis');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  const artistId = req.query.id;

  if (!artistId) {
    return res.status(400).json({ error: '아티스트 ID가 필요합니다.' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'user_table!B:F'; // B열부터 F열까지 읽어옴

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: '시트에서 데이터를 찾을 수 없습니다.' });
    }

    let artistData = null;
    // 첫 번째 행은 헤더이므로 i = 1부터 시작
    for (let i = 0; i < rows.length; i++) { // B열부터 시작하므로 row[0]이 ID
      const row = rows[i];
      if (row[0] === artistId) { // B열이 ID
        artistData = {
          artistId: row[0], // B열
          name: row[1],     // C열
          accountNumber: row[2], // D열
          option: row[3],   // E열
          announce: row[4]  // F열
        };
        break;
      }
    }

    if (artistData) {
      return res.status(200).json(artistData);
    } else {
      return res.status(404).json({ error: `ID '${artistId}'에 대한 정보를 찾을 수 없습니다.` });
    }

  } catch (error) {
    console.error('Google Sheet 접근 중 오류 발생:', error);
    return res.status(500).json({ error: '계좌번호를 가져오는 데 실패했습니다.', details: error.message });
  }
};