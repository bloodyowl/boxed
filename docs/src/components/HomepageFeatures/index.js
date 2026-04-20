import clsx from "clsx"
import styles from "./styles.module.css"

const FeatureList = [
  {
    title: "Avoid accidental complexity",
    svg: (
      <svg
        className={styles.svg}
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m18.492 2.33 3.179 3.179a2.25 2.25 0 0 1 0 3.182l-2.584 2.584A2.25 2.25 0 0 1 21 13.5v5.25A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25A2.25 2.25 0 0 1 5.25 3h5.25a2.25 2.25 0 0 1 2.225 1.915L15.31 2.33a2.25 2.25 0 0 1 3.182 0ZM4.5 18.75c0 .414.336.75.75.75l5.999-.001.001-6.75H4.5v6Zm8.249.749h6.001a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75h-6.001v6.75Zm-2.249-15H5.25a.75.75 0 0 0-.75.75v6h6.75v-6a.75.75 0 0 0-.75-.75Zm2.25 4.81v1.94h1.94l-1.94-1.94Zm3.62-5.918-3.178 3.178a.75.75 0 0 0 0 1.061l3.179 3.179a.75.75 0 0 0 1.06 0l3.18-3.179a.75.75 0 0 0 0-1.06l-3.18-3.18a.75.75 0 0 0-1.06 0Z"
          fill="#6240B5"
        />
      </svg>
    ),
    description: (
      <>
        Boxed provides functional building blocks that make your code more{" "}
        <strong>maintainable</strong>, more <strong>expressive</strong>, and{" "}
        <strong>safer</strong>.
      </>
    ),
  },
  {
    title: "Focused on DX",
    svg: (
      <svg
        className={styles.svg}
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 5.25A3.25 3.25 0 0 1 5.25 2h11.5A3.25 3.25 0 0 1 20 5.25v2.76a4.508 4.508 0 0 0-1.5.096V7h-15v9.75c0 .966.784 1.75 1.75 1.75h7.985l-.441.764a2.457 2.457 0 0 0-.28.736H5.25A3.25 3.25 0 0 1 2 16.75V5.25ZM5.25 3.5A1.75 1.75 0 0 0 3.5 5.25v.25h15v-.25a1.75 1.75 0 0 0-1.75-1.75H5.25ZM19.857 9a3.496 3.496 0 0 0-3.356 1.736 3.5 3.5 0 0 0 .184 3.788l-3.025 5.24a1.459 1.459 0 0 0 2.526 1.458l3.03-5.25a3.5 3.5 0 0 0 2.976-5.761l-1.65 2.858a1.167 1.167 0 1 1-2.021-1.167l1.65-2.858A3.478 3.478 0 0 0 19.857 9Zm-9.554.243a.75.75 0 0 1-.046 1.06L7.86 12.5l2.397 2.197a.75.75 0 0 1-1.014 1.106l-3-2.75a.75.75 0 0 1 0-1.106l3-2.75a.75.75 0 0 1 1.06.046Zm2.954 6.56 2.02-1.852a4.495 4.495 0 0 1-.008-2.91l-2.012-1.844a.75.75 0 0 0-1.014 1.106L14.64 12.5l-2.397 2.197a.75.75 0 0 0 1.014 1.106Z"
          fill="#6240B5"
        />
      </svg>
    ),
    description: (
      <>
        We provide a very <strong>small API surface</strong>. With easy interop,
        and <strong>compatibility</strong> with the ecosystem (like{" "}
        <a href="https://github.com/gvergnaud/ts-pattern">ts-pattern</a>)
      </>
    ),
  },
  {
    title: "Easy to reason about",
    svg: (
      <svg
        className={styles.svg}
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 1.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM9.5 15a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm0 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM11.823 2a5.414 5.414 0 0 1 5.33 4.47h.082a3.765 3.765 0 1 1 0 7.53H6.412a3.765 3.765 0 1 1 0-7.53h.081A5.414 5.414 0 0 1 11.823 2Zm.006 1.498a3.927 3.927 0 0 0-3.923 3.728.693.693 0 0 1-.692.659h-.7a2.31 2.31 0 1 0 0 4.617h10.63a2.31 2.31 0 1 0 0-4.617h-.7a.693.693 0 0 1-.692-.659 3.927 3.927 0 0 0-3.923-3.728Z"
          fill="#6240B5"
        />
      </svg>
    ),
    description: (
      <>
        The concepts exposed by Boxed are <strong>simple</strong> and{" "}
        <strong>accessible</strong>: you don't need a CS degree to get started.
      </>
    ),
  },
]

function Feature({ svg, title, description }) {
  return (
    <div className={clsx("col col--4", styles.feature)}>
      <div className={styles.svgContainer}>{svg}</div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
