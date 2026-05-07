import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 · TripLog",
};

const SERVICE_NAME = "TripLog";
const OPERATOR = "TripLog 운영자";
const CONTACT_EMAIL = "zerosoftdev003@gmail.com";
const EFFECTIVE_DATE = "2026-04-27";

export default function TermsPage() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 py-8 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">이용약관</h1>
        <p className="text-xs text-zinc-500">시행일: {EFFECTIVE_DATE}</p>
      </header>

      <section>
        <h2 className="mb-2 text-base font-semibold">제1조 (목적)</h2>
        <p>
          본 약관은 {OPERATOR}(이하 &quot;운영자&quot;)가 제공하는{" "}
          {SERVICE_NAME}(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 이용자와
          운영자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">제2조 (용어의 정의)</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            &quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원을 말합니다.
          </li>
          <li>
            &quot;여행&quot;이란 이용자가 등록한 일정 단위로, 장소·지출·사진 등의
            기록을 포함하는 데이터 묶음을 의미합니다.
          </li>
          <li>
            &quot;공유 코드&quot;란 여행 단위로 발급되는 식별 코드로서, 코드를
            소지한 다른 이용자가 해당 여행에 참여할 수 있도록 하는 수단입니다.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">제3조 (회원가입 및 계정)</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>이용자는 본 약관 및 개인정보처리방침에 동의함으로써 회원으로 가입할
            수 있습니다.</li>
          <li>이용자는 가입 시 정확한 정보를 제공해야 하며, 변경 사항은 본인이
            갱신할 책임이 있습니다.</li>
          <li>계정 정보(비밀번호 포함)의 관리 책임은 이용자 본인에게 있으며,
            제3자에게 양도·대여할 수 없습니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">제4조 (서비스의 제공)</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>운영자는 이용자에게 다음 기능을 제공합니다: 여행 일정 등록, 장소·
            지출·사진 기록, 공유 코드를 통한 협업, 일정 임박 시 알림.</li>
          <li>운영자는 시스템 장애, 점검, 외부 서비스(푸시 게이트웨이 등) 사정에
            따라 서비스의 일부 또는 전부를 일시적으로 중단할 수 있습니다.</li>
          <li>서비스는 무상 제공을 원칙으로 하며, 향후 유료 기능이 도입될 경우
            사전 공지 후 적용됩니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">제5조 (이용자의 의무)</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>이용자는 관련 법령, 본 약관, 운영자의 공지를 준수해야 합니다.</li>
          <li>다음 행위는 금지됩니다:
            <ul className="ml-5 list-disc">
              <li>타인의 개인정보 또는 권리를 침해하는 콘텐츠 등록</li>
              <li>음란물·불법·폭력적 콘텐츠 업로드</li>
              <li>서비스의 정상 운영을 방해하는 행위(과도한 요청, 자동화 도구 사용 등)</li>
              <li>저작권 등 제3자의 권리를 침해하는 자료 게시</li>
            </ul>
          </li>
          <li>이용자가 등록한 콘텐츠로 인한 분쟁의 책임은 해당 이용자에게 있습니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">제6조 (콘텐츠의 권리)</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>이용자가 등록한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.</li>
          <li>운영자는 서비스 제공 및 안정 운영을 위한 범위 내에서 해당 콘텐츠를
            저장·표시할 수 있습니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">제7조 (계약 해지 및 데이터 삭제)</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>이용자는 언제든지 회원 탈퇴를 요청할 수 있으며, 탈퇴 시 본인이
            등록한 모든 여행·장소·지출·사진 데이터가 영구 삭제됩니다.</li>
          <li>운영자는 이용자가 본 약관을 중대하게 위반한 경우 사전 통지 후
            서비스 이용을 제한하거나 계약을 해지할 수 있습니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">제8조 (면책)</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>운영자는 천재지변, 외부 서비스 장애, 통신 장애 등 불가항력으로
            인한 서비스 중단에 대해 책임지지 않습니다.</li>
          <li>이용자가 입력한 일정·지출 정보의 정확성에 대한 책임은 이용자
            본인에게 있으며, 운영자는 이에 따른 손해에 대해 책임을 지지 않습니다.</li>
          <li>이용자 간(공유 코드를 통한 참여 포함)에 발생한 분쟁은 당사자 간에
            해결해야 합니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">제9조 (약관의 변경)</h2>
        <p>
          운영자는 필요 시 본 약관을 변경할 수 있으며, 변경된 약관은 본 페이지에
          공지된 시점부터 효력을 가집니다. 이용자는 변경 약관에 동의하지 않을
          경우 회원 탈퇴를 통해 서비스 이용을 종료할 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">제10조 (문의)</h2>
        <p>
          서비스 이용에 관한 문의는{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {CONTACT_EMAIL}
          </a>
          으로 보내주시기 바랍니다.
        </p>
      </section>
    </article>
  );
}
