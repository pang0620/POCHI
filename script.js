document.addEventListener('DOMContentLoaded', () => {
  const mainTitle = document.getElementById('mainTitle');
  const instructionMessage = document.getElementById('instructionMessage');
  const accountInfoDisplay = document.getElementById('accountInfoDisplay');
  const optionsContainer = document.getElementById('optionsContainer');
  const copyToClipboardButton = document.getElementById('copyToClipboardButton');
  const simulateNfcScanButton = document.getElementById('simulateNfcScanButton');

  let currentArtistData = null;

  // 페이지 로드 시 기본 ID로 정보 조회
  const urlParams = new URLSearchParams(window.location.search);
  const initialArtistId = urlParams.get('id') || 'example'; // URL 파라미터에서 ID 가져오거나 'example' 사용
  fetchAccountNumber(initialArtistId);

  async function fetchAccountNumber(artistId) {
    if (!artistId) {
      accountInfoDisplay.textContent = '오류: 아티스트 ID가 제공되지 않았습니다.';
      accountInfoDisplay.style.display = 'block';
      return;
    }

    accountInfoDisplay.textContent = `정보 조회 중... (ID: ${artistId})`;
    accountInfoDisplay.style.display = 'block';
    optionsContainer.innerHTML = '';
    optionsContainer.style.display = 'none';
    copyToClipboardButton.style.display = 'none';
    instructionMessage.style.display = 'none'; // 안내 문구 초기 숨김

    try {
      const response = await fetch(`/api/getAccountNumber?id=${encodeURIComponent(artistId)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP 오류! 상태: ${response.status}`);
      }

      const data = await response.json();
      currentArtistData = data;

      // H1 타이틀 업데이트
      mainTitle.textContent = `${data.name || '아티스트'}@POCHI`;

      if (data.accountNumber) {
//		정보 중독으로 인한 주석 처리
//        <p>아티스트: ${data.name || '정보 없음'}</p>
        accountInfoDisplay.innerHTML = `
          <p>계좌번호</p><h1>${data.accountNumber}</h1>
          <p>공지사항</p><h2>${data.announce || '없음'}</h2>
        `;
        accountInfoDisplay.style.display = 'block';
        instructionMessage.style.display = 'block'; // 정보 로드 후 안내 문구 표시

        // 옵션 버튼 생성
        if (data.option) {
          const options = data.option.split(',').map(s => s.trim());
          options.forEach(opt => {
            const button = document.createElement('button');
            button.textContent = `${opt}원`;
            button.classList.add('option-button');
            button.addEventListener('click', () => {
              const textToCopy = `${currentArtistData.accountNumber} ${opt}원`;
              navigator.clipboard.writeText(textToCopy).then(() => {
                alert('클립보드에 복사되었습니다: ' + textToCopy);
              }).catch(err => {
                console.error('클립보드 복사 실패:', err);
                alert('클립보드 복사 실패!');
              });
            });
            optionsContainer.appendChild(button);
          });
          optionsContainer.style.display = 'flex'; // 옵션이 있으면 표시
          copyToClipboardButton.style.display = 'none'; // 옵션이 있으면 이 버튼은 숨김
        } else {
          // 옵션이 없는 경우 계좌번호만 복사하는 버튼 표시
          copyToClipboardButton.textContent = '계좌번호 복사';
          copyToClipboardButton.style.display = 'block';
          optionsContainer.style.display = 'none';
        }

      } else {
        accountInfoDisplay.textContent = `오류: ${data.error || '정보를 찾을 수 없습니다.'}`;
        accountInfoDisplay.style.display = 'block';
      }
    } catch (error) {
      console.error('정보 조회 중 오류 발생:', error);
      accountInfoDisplay.textContent = `오류: ${error.message}`;
      accountInfoDisplay.style.display = 'block';
    }
  }

  // 클립보드 복사 기능 (옵션이 없는 경우 사용)
  copyToClipboardButton.addEventListener('click', () => {
    if (currentArtistData && currentArtistData.accountNumber) {
      const textToCopy = `${currentArtistData.accountNumber}`;
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
