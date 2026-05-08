import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 · TripLog",
};

const SERVICE_NAME = "TripLog";
const OPERATOR = "TripLog 운영자";
const CONTACT_EMAIL = "seung9422@gmail.com";
const EFFECTIVE_DATE = "2026-04-27";

export default function PrivacyPage() {
  return (
    <article className="prose-zinc mx-auto flex max-w-2xl flex-col gap-6 py-8 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          개인정보처리방침
        </h1>
        <p className="text-xs text-zinc-500">
          시행일: {EFFECTIVE_DATE}
        </p>
      </header>

      <p>
        {OPERATOR}(이하 &quot;운영자&quot;)는 {SERVICE_NAME}(이하 &quot;서비스&quot;)
        이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하기
        위하여 본 개인정보처리방침을 수립·공개합니다.
      </p>

      <section>
        <h2 className="mb-2 text-base font-semibold">1. 수집하는 개인정보 항목</h2>
        <p>운영자는 서비스 제공을 위해 다음 정보를 수집합니다.</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>회원가입 시: 이메일 주소, 이름, 비밀번호(단방향 해시 처리)</li>
          <li>
            서비스 이용 시: 이용자가 직접 입력한 여행 일정·장소·지출·메모, 업로드한
            사진 파일
          </li>
          <li>
            푸시 알림 사용 시: 브라우저/기기에서 발급되는 푸시 구독 식별자
            (endpoint, p256dh, auth) 및 User-Agent
          </li>
          <li>자동 수집: 접속 IP, 접속 일시, 서비스 이용 기록(로그)</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">2. 개인정보의 이용 목적</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>회원 식별 및 인증, 본인의 여행 데이터에 대한 접근 제공</li>
          <li>이용자가 등록한 여행 일정의 저장·조회·공유</li>
          <li>이용자가 동의한 일정 알림(푸시 메시지) 발송</li>
          <li>서비스 운영, 부정 이용 방지, 장애 대응</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">3. 보유 및 이용 기간</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>회원 탈퇴 시 또는 이용 목적 달성 시 즉시 파기</li>
          <li>
            관련 법령(전자상거래법, 통신비밀보호법 등)에서 보존을 요구하는 경우
            해당 기간 동안 분리 보관
          </li>
          <li>
            서버 접속 로그: 최대 3개월 (장애 분석 및 부정 이용 추적 목적)
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">4. 제3자 제공 및 처리위탁</h2>
        <p>
          운영자는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 단,
          푸시 알림 발송을 위해 다음과 같이 외부 푸시 게이트웨이로 메시지가
          전달됩니다.
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            Google FCM / Apple APNs 등 운영체제 사업자가 제공하는 푸시 서비스
            (메시지 본문 및 푸시 구독 식별자가 전달되며, 별도의 식별 정보는
            포함되지 않습니다)
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">5. 이용자의 권리와 행사 방법</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>본인의 개인정보 열람·수정·삭제·처리정지 요구 가능</li>
          <li>회원 탈퇴 시 본인이 등록한 모든 데이터(여행/장소/지출/사진)는
            영구 삭제됩니다</li>
          <li>요청은 아래 연락처로 접수해주시기 바랍니다</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">6. 안전성 확보 조치</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>HTTPS(TLS) 통신을 통한 암호화 전송</li>
          <li>비밀번호 단방향 해시(bcrypt) 저장</li>
          <li>JWT 기반 인증 및 권한 분리</li>
          <li>접근 권한 최소화 및 운영 시스템 분리</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">7. 쿠키 및 로컬 저장소</h2>
        <p>
          서비스는 로그인 유지를 위해 브라우저의 localStorage에 인증 토큰을
          저장합니다. 이용자는 브라우저 설정을 통해 이를 삭제할 수 있으며 삭제
          시 자동 로그아웃됩니다.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">8. 개인정보 보호 책임자</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>책임자: {OPERATOR}</li>
          <li>
            연락처:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {CONTACT_EMAIL}
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">9. 변경 고지</h2>
        <p>
          본 방침이 변경되는 경우, 변경 내용과 시행일을 본 페이지를 통해 사전
          공지합니다.
        </p>
      </section>
    </article>
  );
}
