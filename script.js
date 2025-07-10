document.addEventListener('DOMContentLoaded', () => {
  const accountNumberDisplay = document.getElementById('accountNumberDisplay');
  const simulateNfcScanButton = document.getElementById('simulateNfcScanButton');

  async function fetchAccountNumber(artistId) {
    if (!artistId) {
      accountNumberDisplay.textContent = '오류: 아티스트 ID가 제공되지 않았습니다.';
      return;
    }

    accountNumberDisplay.textContent = `계좌번호 조회 중... (ID: ${artistId})`;

    try {
      const response = await fetch(`/api/getAccountNumber?id=${encodeURIComponent(artistId)}`);

      // --- 디버깅 코드 시작 ---
      const contentType = response.headers.get('content-type');
      console.log('서버 응답 Content-Type:', contentType);

      const responseText = await response.text();
      console.log('서버 응답 Raw Text:', responseText);

      // 응답 텍스트를 다시 스트림으로 변환하여 .json() 호출이 가능하도록 함
      const newResponse = new Response(responseText, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      // --- 디버깅 코드 끝 ---

      if (!newResponse.ok) { // newResponse로 변경
        const errorData = await newResponse.json(); // newResponse로 변경
        throw new Error(errorData.error || `HTTP 오류! 상태: ${newResponse.status}`);
      }

      const data = await newResponse.json(); // newResponse로 변경
      if (data.accountNumber) {
        accountNumberDisplay.textContent = `아티스트 ${data.artistId}의 계좌번호: ${data.accountNumber}`;
      } else {
        accountNumberDisplay.textContent = `오류: ${data.error || '계좌번호를 찾을 수 없습니다.'}`;
      }
    } catch (error) {
      console.error('계좌번호 조회 중 오류 발생:', error);
      accountNumberDisplay.textContent = `오류: ${error.message}`;
    }
  }

  if (simulateNfcScanButton) {
    simulateNfcScanButton.addEventListener('click', () => {
      const simulatedArtistId = 'artist-A';
      fetchAccountNumber(simulatedArtistId);
    });
  }
});