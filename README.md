# 🎮 GBA-Style Pokémon Battle Simulator

브라우저에서 즐기는 고품질 8비트 레트로 GBA 스타일 포켓몬 배틀 시뮬레이터입니다.  
실시간 PokéAPI 연동, 전용 8비트 신디사이저 사운드, 박진감 넘치는 피격/공격 애니메이션을 체험해 보세요!

---

## 🛠️ Tech Stack & Architecture

- **Core**: React (TypeScript) + Vite
- **State Management**: Zustand (깔끔하고 예측 가능한 턴제 전역 상태 제어)
- **Styling**: Tailwind CSS (타입별 색상 매핑 및 GBA LCD 패널 픽셀 스타일 섀도우)
- **Animations**: Framer Motion (돌진 어택, 피격 진동 및 레드 플래시, HP 바 감소 감속 처리)
- **Sound Engine**: Web Audio API (외부 무거운 오디오 파일 없이 실시간 브라우저 주파수 합성 기술 적용)
- **Visuals**: Canvas Confetti (플레이어 승리 시 폭죽 축하 효과)
- **Routing**: React Router DOM (v6)

---

## ✨ Key Features

1. **실시간 PokéAPI 연동**: 1세대(1~151번) 포켓몬의 공식 명칭, 스프라이트 이미지, 타입, 4대 핵심 기본 스탯을 실시간 호출합니다.
2. **한국어 로컬라이징**: 영어로 들어오는 포켓몬 명칭과 기술명, 타입을 깔끔한 한국어로 매핑하는 번역 사전을 로컬에 구현하여 속도와 완성도를 올렸습니다.
3. **8비트 오디오 신디사이저**: oscillator 주파수를 직접 합성하여 클릭, 평타 타격, 효과 굉장한 타격, 승리 팡파레, 패배 멜로디를 복고풍 8비트로 구현했습니다.
4. **Zustand 턴제 코어 엔진**: 실제 GBA 데미지 가감 공식을 사용하여 난수 변동폭(85%~100%), 6.25% 크리티컬(급소) 발동, 타입별 속성(2배, 0.5배, 0배 면역) 배율이 실시간으로 로그와 체력바에 반응합니다.
5. **배틀 히스토리**: 플레이한 전적 기록이 브라우저 `localStorage`에 자동 누적되어 승/패, 대전 일시, 대치 턴수, 마주한 포켓몬 전경을 볼 수 있습니다.

---

## 🚀 How to Run Locally

### 1. 의존성 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 빌드 & 검증
```bash
npm run build
```

---

## 📄 PokéAPI Credits
This simulator utilizes data provided by [PokéAPI](https://pokeapi.co/). We thank the PokéAPI team for their free, open-source Pokémon database.
