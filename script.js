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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP 오류! 상태: ${response.status}`);
      }

      const data = await response.json();
      if (data.accountNumber) {
        accountNumberDisplay.innerHTML = `
          <p>아티스트 ID: ${data.artistId}</p>
          <p>이름: ${data.name}</p>
          <p>계좌번호: ${data.accountNumber}</p>
          <p>옵션: ${data.option || '없음'}</p>
          <p>공지: ${data.announce || '없음'}</p>
        `;
      } else {
        accountNumberDisplay.textContent = `오류: ${data.error || '정보를 찾을 수 없습니다.'}`;
      }
    } catch (error) {
      console.error('계좌번호 조회 중 오류 발생:', error);
      accountNumberDisplay.textContent = `오류: ${error.message}`;
    }
  }

  if (simulateNfcScanButton) {
    simulateNfcScanButton.addEventListener('click', () => {
      const simulatedArtistId = prompt('조회할 아티스트 ID를 입력하세요:');
      if (simulatedArtistId) {
        fetchAccountNumber(simulatedArtistId);
      }
    });
  }
});