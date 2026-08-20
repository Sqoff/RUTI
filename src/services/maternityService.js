/**
 * 🤰 RUTI Maternity Care Service
 * 의학적 가이드라인(ACOG / IOM / 보건복지부) 기반 임산부 헬스케어 알고리즘 & 증상별 완화 솔루션
 */

// IOM/ACOG 기준 임신 전 BMI 분류 및 주수별 권장 체중 증가량 데이터
export const BMI_CATEGORIES = {
  UNDERWEIGHT: { name: '저체중', minBmi: 0, maxBmi: 18.49, totalMin: 12.5, totalMax: 18.0, tri1Gain: 1.5, weekRate: 0.51 },
  NORMAL: { name: '정상체중', minBmi: 18.5, maxBmi: 24.99, totalMin: 11.5, totalMax: 16.0, tri1Gain: 1.2, weekRate: 0.42 },
  OVERWEIGHT: { name: '과체중', minBmi: 25.0, maxBmi: 29.99, totalMin: 7.0, totalMax: 11.5, tri1Gain: 0.8, weekRate: 0.28 },
  OBESE: { name: '비만', minBmi: 30.0, maxBmi: 999, totalMin: 5.0, totalMax: 9.0, tri1Gain: 0.5, weekRate: 0.22 }
};

// 주수별 태아 크기 비유 & 발달 팁
export const FETUS_WEEKLY_INFO = {
  4: { item: '양귀비 씨앗', desc: '아기집이 자궁에 안전하게 착상하는 시기예요 🌱' },
  8: { item: '라즈베리', desc: '심장 박동이 활발해지고 팔다리가 생겨나요 🍓' },
  12: { item: '라임', desc: '입덧이 점차 완화되고 태반이 완성되는 시기예요 🍋' },
  16: { item: '아보카도', desc: '태아의 표정이 생기고 뼈가 단단해져요 🥑' },
  20: { item: '바나나', desc: '첫 태동(뽀글뽀글)을 느낄 수 있는 시기예요 🍌' },
  24: { item: '옥수수', desc: '청각이 발달해 엄마의 목소리를 또렷이 들어요 🌽' },
  28: { item: '가지', desc: '눈을 뜨고 빛을 감지하기 시작해요 🍆' },
  32: { item: '배추', desc: '피하지방이 차오르고 포동포동해져요 🥬' },
  36: { item: '멜론', desc: '태아가 골반 쪽으로 내려오며 출산 준비를 해요 🍈' },
  40: { item: '수박', desc: '세상 밖으로 건강하게 만날 준비가 끝났어요 🍉' }
};

/**
 * 출산 예정일(YYYY-MM-DD)로부터 현재 주수, 일차, D-Day 계산
 */
export function calculatePregnancyProgress(dueDateStr) {
  if (!dueDateStr) {
    return { weeks: 20, days: 0, dDay: 140, totalDays: 140, trimester: 2 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 남은 일수

  // 총 280일 (40주) 기준 경과 일수
  const passedDays = Math.max(0, Math.min(280, 280 - dDay));
  const weeks = Math.floor(passedDays / 7);
  const days = passedDays % 7;

  let trimester = 1;
  if (weeks >= 28) trimester = 3;
  else if (weeks >= 14) trimester = 2;

  return {
    weeks: Math.max(1, Math.min(42, weeks)),
    days,
    dDay,
    passedDays,
    trimester
  };
}

/**
 * 주수별 체중 증가 권장 범위 및 현재 상태 분석
 */
export function analyzeWeightGain(preWeight, heightCm, currentWeight, weeks) {
  const heightM = heightCm / 100;
  const bmi = preWeight / (heightM * heightM);

  let category = BMI_CATEGORIES.NORMAL;
  if (bmi < 18.5) category = BMI_CATEGORIES.UNDERWEIGHT;
  else if (bmi >= 30.0) category = BMI_CATEGORIES.OBESE;
  else if (bmi >= 25.0) category = BMI_CATEGORIES.OVERWEIGHT;

  // IOM 가이드라인 주수별 권장 증가량 계산
  let idealMinGain = 0;
  let idealMaxGain = 0;

  if (weeks <= 13) {
    // 초기 (1~13주)
    const ratio = weeks / 13;
    idealMinGain = 0.5 * ratio;
    idealMaxGain = category.tri1Gain * 1.5 * ratio;
  } else {
    // 중·후기 (14~40주)
    const weeksPassedTri1 = weeks - 13;
    idealMinGain = 0.8 + (category.weekRate * 0.8) * weeksPassedTri1;
    idealMaxGain = category.tri1Gain + (category.weekRate * 1.2) * weeksPassedTri1;
  }

  const idealMinWeight = Number((preWeight + idealMinGain).toFixed(1));
  const idealMaxWeight = Number((preWeight + idealMaxGain).toFixed(1));
  const actualGain = Number((currentWeight - preWeight).toFixed(1));

  let status = 'optimal'; // 'low' | 'optimal' | 'high'
  let statusText = '적정 증가 (매우 건강함)';
  let statusDesc = 'ACOG 의학 권장 범위 내에서 안정적으로 체중을 유지하고 계십니다.';

  if (currentWeight < idealMinWeight) {
    status = 'low';
    statusText = '권장치 이하 (완만한 증가)';
    statusDesc = '태아의 성장을 위해 충분한 단백질과 균형 잡힌 영양 섭취를 권장합니다.';
  } else if (currentWeight > idealMaxWeight) {
    status = 'high';
    statusText = '권장치 초과 (급격한 증가 주의)';
    statusDesc = '임신성 당뇨 및 부종 예방을 위해 당류 섭취를 조절하고 가벼운 걷기 운동을 추천합니다.';
  }

  return {
    bmi: Number(bmi.toFixed(1)),
    categoryName: category.name,
    idealMinWeight,
    idealMaxWeight,
    actualGain,
    status,
    statusText,
    statusDesc,
    gainPercentage: Math.min(100, Math.max(0, Math.round(((currentWeight - idealMinWeight) / (idealMaxWeight - idealMinWeight || 1)) * 100)))
  };
}

/**
 * 🩺 임산부 3대 주요 증상별 의학 완화 가이드 데이터베이스
 */
export const MATERNITY_SYMPTOMS_GUIDE = [
  {
    id: 'sciatica',
    title: '환도선다 (천장관절/이상근 통증)',
    icon: '⚡',
    shortDesc: '골반 뒤쪽 엉치뼈가 찌릿하고 다리를 디딜 때 통증이 오는 증상',
    cause: '릴랙신 호르몬 분비로 골반 인대가 느슨해지고 태아 하중으로 이상근이 좌골신경을 압박합니다.',
    exercises: [
      {
        name: '의자 4자 이상근 스트레칭',
        duration: '좌/우 각 40초',
        guide: '의자에 앉아 한쪽 발목을 반대쪽 무릎 위에 올려 4자를 만든 후 허리를 곧게 펴고 상체를 살짝 앞으로 기울여 엉덩이 깊은 곳을 이완합니다.'
      },
      {
        name: '고양이-소 부드러운 골반 틸팅',
        duration: '10회 천천히 반복',
        guide: '네발기기 자세에서 숨을 내쉬며 등을 둥글게 말고 골반을 살짝 당겼다가, 마시며 편평한 중립 자세로 돌아옵니다.'
      },
      {
        name: '짐볼 골반 부드러운 서클링',
        duration: '1분간 좌/우 회전',
        guide: '짐볼에 앉아 골반을 시계/반시계 방향으로 부드럽게 돌려 천장관절의 긴장을 해소합니다.'
      }
    ],
    doctorTips: [
      '수면 시 옆으로 눕고 다리 사이에 도톰한 바디필로우를 끼워 골반 수평을 유지하세요.',
      '통증 부위에 15분 이내의 미온 찜질을 해주면 근육 이완에 도움을 줍니다.',
      '양반다리나 다리 꼬기는 이상근 압박을 악화시키므로 피해주세요.'
    ]
  },
  {
    id: 'pelvic_back',
    title: '골반 & 허리 통증 (Pelvic & Back Pain)',
    icon: '🦴',
    shortDesc: '배가 나오면서 허리가 젖혀지고 골반 앞뒤가 묵직하게 쑤시는 증상',
    cause: '무게중심이 앞으로 이동하며 골반 전방경사(Anterior Tilt) 및 허리 기립근 과긴장이 발생합니다.',
    exercises: [
      {
        name: '골반저근 케겔 & 횡격막 호흡',
        duration: '10회 (3세트)',
        guide: '편안히 앉아 코로 숨을 마실 때 골반저근을 이완하고, 입으로 내쉬며 회음부를 부드럽게 위로 끌어올리듯 수축합니다.'
      },
      {
        name: '수정형 버드독 (Bird-Dog)',
        duration: '좌/우 각 5회',
        guide: '네발기기 자세에서 허리가 꺾이지 않도록 복부를 가볍게 지탱하며 한쪽 팔과 반대쪽 다리를 바닥과 수평까지만 뻗어줍니다.'
      },
      {
        name: '벽 짐볼 스쿼트 (안전형)',
        duration: '8~10회',
        guide: '벽과 허리 사이에 짐볼을 받치고 다리를 어깨너비보다 넓게 벌려 안전하게 무릎을 90도 미만으로 굽혔다 일어납니다.'
      }
    ],
    doctorTips: [
      '장시간 서 있을 때는 낮은 발받침대에 한쪽 발을 번갈아 올려 허리 하중을 분산하세요.',
      '임산부 전용 산전 복대(Pelvic Belt)를 착용하면 골반 안정화에 큰 도움이 됩니다.'
    ]
  },
  {
    id: 'edema',
    title: '하지 부종 & 다리 쥐남 (Edema & Cramps)',
    icon: '💧',
    shortDesc: '저녁이 되면 종아리와 발목이 붓고 밤에 자다가 종아리에 쥐가 나는 증상',
    cause: '혈액량 40% 증가 및 커진 자궁이 하지 대정맥을 압박하여 혈액·림프 순환이 정체됩니다.',
    exercises: [
      {
        name: '발목 펌핑 운동 (Ankle Pumps)',
        duration: '30회 반복',
        guide: '발끝을 몸쪽으로 바짝 당겼다(플렉스)가 앞으로 길게 뻗는(포인) 동작을 반복하여 종아리 근육 펌프를 활성화합니다.'
      },
      {
        name: '벽 거치 완만한 L자 다리 (상체 30도 거치)',
        duration: '5~10분',
        guide: '상체 뒤에 베개를 괴어 30도 이상 세운 상태에서 다리를 벽에 기대어 하지 림프 순환을 돕습니다. (완전히 평평하게 눕지 마세요)'
      },
      {
        name: '종아리 폼롤러/손 마사지',
        duration: '좌/우 각 2분',
        guide: '발목에서 무릎 방향(심장 쪽)으로 부드럽게 쓸어올리며 림프 마사지를 진행합니다.'
      }
    ],
    doctorTips: [
      '수분 섭취를 줄이면 오히려 부종이 심해집니다. 하루 1.5~2L 미온수를 충분히 마셔주세요.',
      '취침 전 따뜻한 물로 10분간 족욕을 하고 마그네슘이 풍부한 바나나, 견과류를 섭취하면 다리 쥐 예방에 좋습니다.'
    ]
  }
];
