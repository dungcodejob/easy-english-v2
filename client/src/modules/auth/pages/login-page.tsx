import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '../components/login-form';

export const Route = createFileRoute('/_(unauthenticated)/login')({
  component: LoginPage,
});

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div
        data-slot="card"
        className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 relative w-full max-w-md overflow-hidden border-none pt-12 shadow-lg"
      >
        <div className="to-primary/10 pointer-events-none absolute top-0 h-52 w-full rounded-t-xl bg-linear-to-t from-transparent"></div>
        <svg
          width="520"
          height="209"
          viewBox="0 0 520 209"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute inset-x-0 top-0"
        >
          <line
            x1="26.25"
            y1="1.07096e-08"
            x2="26.25"
            y2="94.7007"
            stroke="url(#paint0_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="45.25"
            y1="1.07096e-08"
            x2="45.25"
            y2="109.92"
            stroke="url(#paint1_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="65.25"
            y1="1.07096e-08"
            x2="65.25"
            y2="130.213"
            stroke="url(#paint2_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="84.25"
            y1="1.07096e-08"
            x2="84.25"
            y2="130.213"
            stroke="url(#paint3_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="104.25"
            y1="1.07096e-08"
            x2="104.25"
            y2="145.433"
            stroke="url(#paint4_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="123.25"
            y1="1.07096e-08"
            x2="123.25"
            y2="172.49"
            stroke="url(#paint5_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="143.25"
            y1="1.07096e-08"
            x2="143.25"
            y2="172.49"
            stroke="url(#paint6_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="163.25"
            y1="1.07096e-08"
            x2="163.25"
            y2="172.49"
            stroke="url(#paint7_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="182.25"
            y1="1.07096e-08"
            x2="182.25"
            y2="145.433"
            stroke="url(#paint8_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="202.25"
            y1="1.07096e-08"
            x2="202.25"
            y2="130.213"
            stroke="url(#paint9_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="221.25"
            y1="1.07096e-08"
            x2="221.25"
            y2="130.213"
            stroke="url(#paint10_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="241.25"
            y1="1.07096e-08"
            x2="241.25"
            y2="109.92"
            stroke="url(#paint11_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="260.25"
            y1="1.07096e-08"
            x2="260.25"
            y2="94.7007"
            stroke="url(#paint12_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="279.25"
            y1="1.07096e-08"
            x2="279.25"
            y2="109.92"
            stroke="url(#paint13_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="299.25"
            y1="1.07096e-08"
            x2="299.25"
            y2="130.213"
            stroke="url(#paint14_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="318.25"
            y1="1.07096e-08"
            x2="318.25"
            y2="130.213"
            stroke="url(#paint15_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="338.25"
            y1="1.07096e-08"
            x2="338.25"
            y2="145.433"
            stroke="url(#paint16_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="357.25"
            y1="1.07096e-08"
            x2="357.25"
            y2="172.49"
            stroke="url(#paint17_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="377.25"
            y1="1.07096e-08"
            x2="377.25"
            y2="172.49"
            stroke="url(#paint18_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="397.25"
            y1="1.07096e-08"
            x2="397.25"
            y2="172.49"
            stroke="url(#paint19_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="416.25"
            y1="1.07096e-08"
            x2="416.25"
            y2="145.433"
            stroke="url(#paint20_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="436.25"
            y1="1.07096e-08"
            x2="436.25"
            y2="130.213"
            stroke="url(#paint21_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="455.25"
            y1="1.07096e-08"
            x2="455.25"
            y2="130.213"
            stroke="url(#paint22_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="474.25"
            y1="1.07096e-08"
            x2="474.25"
            y2="109.92"
            stroke="url(#paint23_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <line
            x1="494.25"
            y1="1.07096e-08"
            x2="494.25"
            y2="94.7007"
            stroke="url(#paint24_linear_20485_40176)"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          ></line>
          <defs>
            <linearGradient
              id="paint0_linear_20485_40176"
              x1="25.5"
              y1="-2.14191e-08"
              x2="25.5"
              y2="94.7007"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint1_linear_20485_40176"
              x1="44.5"
              y1="-2.14191e-08"
              x2="44.5"
              y2="109.92"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint2_linear_20485_40176"
              x1="64.5"
              y1="-2.14191e-08"
              x2="64.5"
              y2="130.213"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint3_linear_20485_40176"
              x1="83.5"
              y1="-2.14191e-08"
              x2="83.5"
              y2="130.213"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint4_linear_20485_40176"
              x1="103.5"
              y1="-2.14191e-08"
              x2="103.5"
              y2="145.433"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint5_linear_20485_40176"
              x1="122.5"
              y1="-2.14191e-08"
              x2="122.5"
              y2="172.49"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint6_linear_20485_40176"
              x1="142.5"
              y1="-2.14191e-08"
              x2="142.5"
              y2="172.49"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint7_linear_20485_40176"
              x1="162.5"
              y1="-2.14191e-08"
              x2="162.5"
              y2="172.49"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint8_linear_20485_40176"
              x1="181.5"
              y1="-2.14191e-08"
              x2="181.5"
              y2="145.433"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint9_linear_20485_40176"
              x1="201.5"
              y1="-2.14191e-08"
              x2="201.5"
              y2="130.213"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint10_linear_20485_40176"
              x1="220.5"
              y1="-2.14191e-08"
              x2="220.5"
              y2="130.213"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint11_linear_20485_40176"
              x1="240.5"
              y1="-2.14191e-08"
              x2="240.5"
              y2="109.92"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint12_linear_20485_40176"
              x1="259.5"
              y1="-2.14191e-08"
              x2="259.5"
              y2="94.7007"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint13_linear_20485_40176"
              x1="278.5"
              y1="-2.14191e-08"
              x2="278.5"
              y2="109.92"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint14_linear_20485_40176"
              x1="298.5"
              y1="-2.14191e-08"
              x2="298.5"
              y2="130.213"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint15_linear_20485_40176"
              x1="317.5"
              y1="-2.14191e-08"
              x2="317.5"
              y2="130.213"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint16_linear_20485_40176"
              x1="337.5"
              y1="-2.14191e-08"
              x2="337.5"
              y2="145.433"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint17_linear_20485_40176"
              x1="356.5"
              y1="-2.14191e-08"
              x2="356.5"
              y2="172.49"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint18_linear_20485_40176"
              x1="376.5"
              y1="-2.14191e-08"
              x2="376.5"
              y2="172.49"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint19_linear_20485_40176"
              x1="396.5"
              y1="-2.14191e-08"
              x2="396.5"
              y2="172.49"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint20_linear_20485_40176"
              x1="415.5"
              y1="-2.14191e-08"
              x2="415.5"
              y2="145.433"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint21_linear_20485_40176"
              x1="435.5"
              y1="-2.14191e-08"
              x2="435.5"
              y2="130.213"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint22_linear_20485_40176"
              x1="454.5"
              y1="-2.14191e-08"
              x2="454.5"
              y2="130.213"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint23_linear_20485_40176"
              x1="474.5"
              y1="-2.14191e-08"
              x2="474.5"
              y2="109.92"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
            <linearGradient
              id="paint24_linear_20485_40176"
              x1="493.5"
              y1="-2.14191e-08"
              x2="493.5"
              y2="94.7007"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--primary)"></stop>
              <stop offset="1" stopColor="var(--primary-foreground)"></stop>
            </linearGradient>
          </defs>
        </svg>

        <div
          data-slot="card-header"
          className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 justify-center gap-6 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 328 329"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-8.5"
            >
              <rect
                y="0.5"
                width="328"
                height="328"
                rx="164"
                fill="black"
                className="dark:fill-white"
              ></rect>
              <path
                d="M165.018 72.3008V132.771C165.018 152.653 148.9 168.771 129.018 168.771H70.2288"
                stroke="white"
                strokeWidth="20"
                className="dark:stroke-black"
              ></path>
              <path
                d="M166.627 265.241L166.627 204.771C166.627 184.889 182.744 168.771 202.627 168.771L261.416 168.771"
                stroke="white"
                strokeWidth="20"
                className="dark:stroke-black"
              ></path>
              <line
                x1="238.136"
                y1="98.8184"
                x2="196.76"
                y2="139.707"
                stroke="white"
                strokeWidth="20"
                className="dark:stroke-black"
              ></line>
              <line
                x1="135.688"
                y1="200.957"
                x2="94.3128"
                y2="241.845"
                stroke="white"
                strokeWidth="20"
                className="dark:stroke-black"
              ></line>
              <line
                x1="133.689"
                y1="137.524"
                x2="92.5566"
                y2="96.3914"
                stroke="white"
                strokeWidth="20"
                className="dark:stroke-black"
              ></line>
              <line
                x1="237.679"
                y1="241.803"
                x2="196.547"
                y2="200.671"
                stroke="white"
                strokeWidth="20"
                className="dark:stroke-black"
              ></line>
            </svg>
            <span className="text-xl font-semibold">shadcn/studio</span>
          </div>
          <div>
            <div
              data-slot="card-title"
              className="font-semibold mb-1.5 text-2xl"
            >
              Log In to Shadcn Studio
            </div>
            <div
              data-slot="card-description"
              className="text-muted-foreground text-base"
            >
              Please enter your details to log in
            </div>
          </div>
        </div>

        <div data-slot="card-content" className="px-6">
          <div className="mb-6 flex items-center gap-2.5">
            <a
              href="#"
              data-slot="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 grow"
            >
              <img
                src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png"
                alt="google icon"
                className="size-5"
              />
            </a>
            <a
              href="#"
              data-slot="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 grow"
            >
              <img
                src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/facebook-icon.png"
                alt="facebook icon"
                className="size-5"
              />
            </a>
            <a
              href="#"
              data-slot="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 grow"
            >
              <img
                src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/github-icon.png"
                alt="github icon"
                className="size-5 dark:invert"
              />
            </a>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div
              data-orientation="horizontal"
              role="none"
              data-slot="separator"
              className="bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px flex-1"
            ></div>
            <p>or</p>
            <div
              data-orientation="horizontal"
              role="none"
              data-slot="separator"
              className="bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px flex-1"
            ></div>
          </div>

          <LoginForm />

          <p className="text-muted-foreground mt-4 text-center">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="text-card-foreground hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
