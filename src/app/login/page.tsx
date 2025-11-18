export default function Login() {
  return (
    <div className="box-border content-stretch flex h-[866px] items-center justify-between gap-[80px] p-[80px] relative w-full max-w-[1512px] bg-gray-900">
      <div className="content-stretch flex flex-col h-full items-start justify-between relative shrink-0 w-[425px]">
        <div className="content-stretch flex flex-col gap-[80px] items-start leading-[normal] relative shrink-0 w-full">
          <p
            className="font-['League_Spartan',_sans-serif] relative shrink-0 text-[#228c1d] text-[60.444px] text-nowrap uppercase whitespace-pre"
            role="font-weight: 600;"
          >
            GUIDR
          </p>
          <p
            className="font-['Arimo',_sans-serif] min-w-full relative shrink-0 text-[#f9f9f9] text-[48px]"
            role="width: min-content; font-weight: 400;"
          >
            Guided by purpose. Driven by people.
          </p>
        </div>
        <div className="bg-[rgba(255,255,255,0.08)] relative rounded-[10px] shrink-0 w-full">
          <div
            aria-hidden="true"
            className="absolute border border-[rgba(13,66,10,0.58)] border-solid inset-[-1px] pointer-events-none rounded-[11px]"
          ></div>
          <div className="flex flex-row items-center justify-center size-full">
            <div className="box-border content-stretch flex gap-[10px] items-center justify-center p-[22px] relative w-full">
              <p
                className="basis-0 font-['Arimo',_sans-serif] grow leading-[30px] min-h-px min-w-px relative shrink-0 text-[#f9f9f9] text-[18px]"
                role="font-weight: 400;"
              >
                Simplifying the way organizations connect with mentors and
                opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#f9f9f9] box-border content-stretch flex flex-col gap-[30px] items-start p-[50px] relative rounded-[10px] shrink-0 w-[619px]">
        <div
          aria-hidden="true"
          className="absolute border border-[rgba(32,64,30,0.77)] border-solid inset-[-1px] pointer-events-none rounded-[11px]"
        ></div>
        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
          <p className="font-['Arimo',_sans-serif] leading-[normal] relative shrink-0 text-[#0d110d] text-[34px] text-nowrap whitespace-pre font-normal">
            Get Started
          </p>
          <div
            className="content-stretch flex font-['Arimo',_sans-serif] gap-[16px] items-center leading-[25px] relative shrink-0 text-[16px] text-nowrap tracking-[0.32px] whitespace-pre"
            role="font-weight: 400;"
          >
            <p className="relative shrink-0 text-[#0d110d]">
              Already have an account?
            </p>
            <button className="[text-underline-position:from-font] decoration-solid relative shrink-0 text-[#228c1d] underline hover:text-[#1a6e16] transition-colors">
              Login
            </button>
          </div>
        </div>
        <form className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[18px] items-start relative shrink-0 w-full">
            <p
              className="font-['Arimo',_sans-serif] leading-[25px] relative shrink-0 text-[#228c1d] text-[14px] text-nowrap tracking-[0.56px] whitespace-pre"
              role="font-weight: 400;"
            >
              Select the role you&apos;re signing up for.
            </p>
            <div className="content-stretch flex h-[46px] items-center relative shrink-0 w-full border-b border-[#bfbfbf]">
              <button
                type="button"
                className="basis-0 grow min-h-px min-w-px relative shrink-0"
              >
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-[25px] py-[18px] relative w-full">
                    <p
                      className="font-['Arimo',_sans-serif] leading-[25px] relative shrink-0 text-[#228c1d] text-[16px] text-nowrap tracking-[0.32px] whitespace-pre transition-colors duration-300"
                      role="font-weight: 400;"
                    >
                      Organization
                    </p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                className="basis-0 grow min-h-px min-w-px relative shrink-0"
              >
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-[25px] py-[18px] relative w-full">
                    <p
                      className="font-['Arimo',_sans-serif] leading-[25px] relative shrink-0 text-[#6c6c6c] text-[16px] text-nowrap tracking-[0.32px] whitespace-pre transition-colors duration-300"
                      role="font-weight: 400;"
                    >
                      Mentor
                    </p>
                  </div>
                </div>
              </button>
              <div
                className="absolute bottom-[-1px] h-[2px] bg-[#228c1d] w-1/2"
                role="transform: none;"
              ></div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
            <div className="relative rounded-[999px] shrink-0 w-full">
              <div
                aria-hidden="true"
                className="absolute border border-[#bfbfbf] border-solid inset-0 pointer-events-none rounded-[999px]"
              ></div>
              <div className="flex flex-row items-center size-full">
                <input
                  type="text"
                  placeholder="Organization name"
                  className="box-border w-full bg-transparent outline-none px-[16px] py-[16px] font-['Arimo',_sans-serif] leading-[25px] text-[14px] tracking-[0.56px] placeholder:text-[#6c6c6c] focus:ring-2 focus:ring-[#228c1d] rounded-[999px]"
                  value=""
                  role="font-weight: 400; color: rgb(108, 108, 108);"
                />
              </div>
            </div>
            <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
              <div className="basis-0 grow min-h-px min-w-px relative rounded-[999px] shrink-0">
                <div
                  aria-hidden="true"
                  className="absolute border border-[#bfbfbf] border-solid inset-0 pointer-events-none rounded-[999px]"
                ></div>
                <div className="flex flex-row items-center size-full">
                  <input
                    type="email"
                    placeholder="Email"
                    className="box-border w-full bg-transparent outline-none px-[16px] py-[16px] font-['Arimo',_sans-serif] leading-[25px] text-[14px] tracking-[0.56px] placeholder:text-[#6c6c6c] focus:ring-2 focus:ring-[#228c1d] rounded-[999px]"
                    value=""
                    role="font-weight: 400; color: rgb(108, 108, 108);"
                  />
                  <div
                    data-lastpass-icon-root=""
                    role="position: relative !important; height: 0px !important; width: 0px !important; display: initial !important; float: left !important;"
                  ></div>
                </div>
              </div>
              <div className="basis-0 grow min-h-px min-w-px relative rounded-[999px] shrink-0">
                <div
                  aria-hidden="true"
                  className="absolute border border-[#bfbfbf] border-solid inset-0 pointer-events-none rounded-[999px]"
                ></div>
                <div className="flex flex-row items-center size-full">
                  <input
                    type="password"
                    placeholder="Password"
                    className="box-border w-full bg-transparent outline-none px-[16px] py-[16px] font-['Arimo',_sans-serif] leading-[25px] text-[14px] tracking-[0.56px] placeholder:text-[#6c6c6c] focus:ring-2 focus:ring-[#228c1d] rounded-[999px]"
                    value=""
                    role="font-weight: 400; color: rgb(13, 17, 13);"
                  />
                  <div
                    data-lastpass-icon-root=""
                    role="position: relative !important; height: 0px !important; width: 0px !important; display: initial !important; float: left !important;"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-[8px] items-start justify-center relative shrink-0 w-full">
            <button
              type="button"
              className="relative rounded-[999px] shrink-0 size-[18px] flex items-center justify-center mt-[4px]"
            >
              <div
                aria-hidden="true"
                className="absolute border-[2px] border-[#228c1d] border-solid inset-0 pointer-events-none rounded-[1000px]"
              ></div>
            </button>
            <div
              className="flex font-['Arimo',_sans-serif] gap-[6px] items-center leading-[25px] relative shrink-0 text-[14px] text-nowrap tracking-[0.56px] whitespace-pre"
              role="font-weight: 400;"
            >
              <p className="relative shrink-0 text-[#0d110d]">
                By creating an account, you agree to guidr&apos;s
              </p>
              <button
                type="button"
                className="[text-underline-position:from-font] decoration-solid relative shrink-0 text-[#228c1d] underline hover:text-[#1a6e16] transition-colors"
              >
                Terms of Use
              </button>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[22px] items-start relative shrink-0 w-[519px]">
            <button
              type="submit"
              //   disabled=""
              className="relative rounded-[999px] shrink-0 w-full bg-[#bfbfbf] transition-colors"
            >
              <div className="flex flex-row items-center justify-center size-full">
                <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-[30px] py-[14px] relative w-full">
                  <p
                    className="font-['Arimo',_sans-serif] leading-[25px] relative shrink-0 text-[#6c6c6c] text-[14px] text-nowrap tracking-[0.56px] whitespace-pre"
                    role="font-weight: 400;"
                  >
                    Create account
                  </p>
                </div>
              </div>
            </button>
            <div className="content-stretch flex gap-[18px] h-[10px] items-center relative shrink-0 w-full">
              <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0">
                <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                  <svg
                    className="block size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 232 1"
                  >
                    <line
                      stroke="rgba(191, 191, 191, 1)"
                      x2="231.5"
                      y1="0.5"
                      y2="0.5"
                    ></line>
                  </svg>
                </div>
              </div>
              <p
                className="font-['Inter',_sans-serif] leading-[normal] not-italic relative shrink-0 text-[#228c1d] text-[14px] text-nowrap whitespace-pre"
                role="font-weight: 600;"
              >
                OR
              </p>
              <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0">
                <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                  <svg
                    className="block size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 232 1"
                  >
                    <line
                      stroke="rgba(191, 191, 191, 1)"
                      x2="231.5"
                      y1="0.5"
                      y2="0.5"
                    ></line>
                  </svg>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="relative rounded-[999px] shrink-0 w-full  transition-colors"
            >
              <div
                aria-hidden="true"
                className="absolute border-2 border-[#bfbfbf] border-solid inset-0 pointer-events-none rounded-[1000px]"
              ></div>
              <div className="flex flex-row items-center justify-center size-full">
                <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-[30px] py-[10px] relative w-full">
                  <div className="relative shrink-0 size-[20px]">
                    <svg
                      className="block size-full"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 20 20"
                    >
                      <g clip-path="url(#clip0_google_disabled)">
                        <path
                          d="M19.5745 10.2246C19.5745 9.43964 19.512 8.79964 19.3745 8.13464H9.98698V11.8871H15.492C15.38 12.7621 14.7807 14.1996 13.445 15.1371L13.4325 15.2621L16.3911 17.5621L16.5909 17.5871C18.4884 15.8371 19.5745 13.2621 19.5745 10.2246Z"
                          fill="#BFBFBF"
                        ></path>
                        <path
                          d="M9.98677 20C12.6833 20 14.9429 19.1125 16.5908 17.5875L13.4449 15.1375C12.6084 15.7125 11.4849 16.125 9.98677 16.125C7.35271 16.125 5.11813 14.375 4.31917 11.975L4.20681 11.9875L1.11086 14.375L1.07341 14.4875C2.70877 17.75 6.07938 20 9.98677 20Z"
                          fill="#BFBFBF"
                        ></path>
                        <path
                          d="M4.30689 11.975C4.09466 11.35 3.96968 10.6875 3.96968 10C3.96968 9.3125 4.09466 8.65 4.3194 8.025V7.8875L1.17347 5.4625L1.07361 5.5125C0.386995 6.8625 0 8.3875 0 10C0 11.6125 0.386995 13.1375 1.06112 14.4875L4.30689 11.975Z"
                          fill="#BFBFBF"
                        ></path>
                        <path
                          d="M9.98705 3.875C11.8595 3.875 13.1331 4.675 13.8447 5.35L16.6659 2.6C14.9307 0.9875 12.6835 0 9.98705 0C6.07966 0 2.70905 2.25 1.07346 5.5125L4.31947 8.025C5.11093 5.6125 7.35301 3.875 9.98705 3.875Z"
                          fill="#BFBFBF"
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_google_disabled">
                          <rect fill="white" height="20" width="20"></rect>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <p
                    className="font-['Arimo',_sans-serif] leading-[25px] relative shrink-0 text-[#6c6c6c] text-[14px] text-nowrap tracking-[0.56px] whitespace-pre"
                    role="font-weight: 400;"
                  >
                    Sign-up with Google
                  </p>
                </div>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
