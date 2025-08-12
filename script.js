document.addEventListener('DOMContentLoaded', () => {
  const mainTitle = document.getElementById('mainTitle');
  const instructionMessage = document.getElementById('instructionMessage');
  const accountInfoDisplay = document.getElementById('accountInfoDisplay');
  const optionsContainer = document.getElementById('optionsContainer');
  const copyToClipboardButton = document.getElementById('copyToClipboardButton');
  const totalAmountDisplay = document.getElementById('totalAmountDisplay');
  const totalAmountSpan = document.getElementById('totalAmount');
  const simulateNfcScanButton = document.getElementById('simulateNfcScanButton');

  let currentArtistData = null;
  let totalAmount = 0;

  const urlParams = new URLSearchParams(window.location.search);
  const initialArtistId = urlParams.get('id') || 'example';
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
    instructionMessage.style.display = 'none';
    totalAmountDisplay.style.display = 'none';
    totalAmount = 0;
    totalAmountSpan.textContent = '0';

    try {
      const response = await fetch(`/api/getAccountNumber?id=${encodeURIComponent(artistId)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP 오류! 상태: ${response.status}`);
      }

      const data = await response.json();
      currentArtistData = data;

      mainTitle.textContent = `${data.name || '아티스트'}@POCHI`;

      if (data.accountNumber) {
        accountInfoDisplay.innerHTML = `
          <p>계좌번호</p><h1>${data.accountNumber}</h1>
          <p>공지사항</p><h2>${data.announce || '없음'}</h2>
        `;
        accountInfoDisplay.style.display = 'block';
        instructionMessage.style.display = 'block';

        if (data.option) {
          const options = data.option.split(',').map(s => s.trim());
          options.forEach(opt => {
            const button = document.createElement('button');
            const amount = parseInt(opt.replace(/[^0-9]/g, ''), 10);
            button.textContent = `${opt}원`;
            button.classList.add('option-button');
            button.dataset.amount = amount;

            button.addEventListener('click', () => {
              if (button.classList.contains('active')) {
                totalAmount -= amount;
                button.classList.remove('active');
              } else {
                totalAmount += amount;
                button.classList.add('active');
              }
              totalAmountSpan.textContent = totalAmount.toLocaleString();
            });

            optionsContainer.appendChild(button);
          });
          optionsContainer.style.display = 'flex';
          totalAmountDisplay.style.display = 'block';
          copyToClipboardButton.style.display = 'block';
        } else {
          copyToClipboardButton.textContent = '계좌번호 복사';
          copyToClipboardButton.style.display = 'block';
          optionsContainer.style.display = 'none';
          totalAmountDisplay.style.display = 'none';
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

  copyToClipboardButton.addEventListener('click', () => {
    if (currentArtistData && currentArtistData.accountNumber) {
      let textToCopy = currentArtistData.accountNumber;
      if (totalAmount > 0) {
        textToCopy += ` ${totalAmount}`;
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