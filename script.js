document.addEventListener('DOMContentLoaded', () => {
  const accountInfoDisplay = document.getElementById('accountInfoDisplay');
  const optionsContainer = document.getElementById('optionsContainer');
  const copyToClipboardButton = document.getElementById('copyToClipboardButton');
  const simulateNfcScanButton = document.getElementById('simulateNfcScanButton');

  let currentArtistData = null;
  let selectedAmount = 0;

  async function fetchAccountNumber(artistId) {
    if (!artistId) {
      accountInfoDisplay.textContent = '오류: 아티스트 ID가 제공되지 않았습니다.';
      return;
    }

    accountInfoDisplay.textContent = `정보 조회 중... (ID: ${artistId})`;
    optionsContainer.innerHTML = '';
    copyToClipboardButton.style.display = 'none';

    try {
      const response = await fetch(`/api/getAccountNumber?id=${encodeURIComponent(artistId)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP 오류! 상태: ${response.status}`);
      }

      const data = await response.json();
      currentArtistData = data;

      if (data.accountNumber) {
        accountInfoDisplay.innerHTML = `
          <p>아티스트 이름: ${data.name || '정보 없음'}</p>
          <p>공지사항: ${data.announce || '없음'}</p>
          <p>계좌번호: ${data.accountNumber}</p>
        `;

        // 옵션 버튼 생성
        if (data.option) {
          const options = data.option.split(',').map(s => s.trim());
          options.forEach(opt => {
            const button = document.createElement('button');
            button.textContent = `${opt}원`;
            button.classList.add('option-button');
            button.addEventListener('click', () => {
              selectedAmount = parseInt(opt);
              // 모든 버튼에서 active 클래스 제거
              document.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('active'));
              // 클릭된 버튼에 active 클래스 추가
              button.classList.add('active');
              copyToClipboardButton.style.display = 'block';
            });
            optionsContainer.appendChild(button);
          });
        } else {
          // 옵션이 없는 경우 바로 복사 버튼 표시
          copyToClipboardButton.style.display = 'block';
        }

      } else {
        accountInfoDisplay.textContent = `오류: ${data.error || '정보를 찾을 수 없습니다.'}`;
      }
    } catch (error) {
      console.error('정보 조회 중 오류 발생:', error);
      accountInfoDisplay.textContent = `오류: ${error.message}`;
    }
  }

  // 클립보드 복사 기능
  copyToClipboardButton.addEventListener('click', () => {
    if (currentArtistData && currentArtistData.accountNumber) {
      let textToCopy = `${currentArtistData.accountNumber}`;
      if (selectedAmount > 0) {
        textToCopy += ` ${selectedAmount}원`;
      }

      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('클립보드에 복사되었습니다: ' + textToCopy);
      }).catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('클립보드 복사 실패!');
      });
    } else {
      alert('복사할 정보가 없습니다.');
    }
  });

  if (simulateNfcScanButton) {
    simulateNfcScanButton.addEventListener('click', () => {
      const simulatedArtistId = prompt('조회할 아티스트 ID를 입력하세요:');
      if (simulatedArtistId) {
        fetchAccountNumber(simulatedArtistId);
      }
    });
  }
});