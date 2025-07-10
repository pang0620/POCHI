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