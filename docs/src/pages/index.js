import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import HomepageFeatures from "@site/src/components/HomepageFeatures"
import CodeBlock from "@theme/CodeBlock"
import Layout from "@theme/Layout"
import clsx from "clsx"
import React from "react"
import styles from "./index.module.css"

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className={styles.heroLeft}>
        <img
          src={"./img/logo.svg"}
          alt="Boxed logo"
          className={styles.heroLogo}
        />
        <div>
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <div className={styles.heroButtons}>
            <Link
              className={clsx("button button--lg", styles.heroButton)}
              to="/getting-started"
            >
              Get started
            </Link>
            <span className={styles.heroButtonSeparator} />
            <Link
              className={clsx("button button--lg", styles.heroButton)}
              to="/option"
            >
              API reference
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.heroCode}>
        <CodeBlock className={styles.heroCodeBlock} language="typescript">
          {`import { AsyncData } from "@bloodyowl/boxed";

const UserCard = ({user}: {user: AsyncData<User>}) => {
  return user.match({
    NotAsked: () => null,
    Loading: () => \`Loading\`,
    Done: (user) => {
      const name = user.name.getOr("anonymous");
      return \`Hello \${name}!\`;
    },
  });
};`}
        </CodeBlock>
      </div>
    </header>
  )
}

const Block = ({ children, reversed = false, title, description }) => {
  return (
    <div
      className={reversed ? styles.contentBlockReversed : styles.contentBlock}
    >
      <div className={styles.contentBlockSide}>{children}</div>
      <div className={styles.contentBlockSide}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  const videoContainer = React.useRef(null)

  React.useEffect(() => {
    const element = videoContainer.current
    if (element) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const video = element.querySelector("video")
              if (video) {
                video.play()
              }
            }
          })
        },
        {
          rootMargin: "100px",
        },
      )
      intersectionObserver.observe(element)
      return () => intersectionObserver.unobserve(element)
    }
  }, [])

  return (
    <Layout
      title={`Boxed: ${siteConfig.tagline}`}
      description="Essential building-blocks for functional & safe TypeScript code"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <div className="container">
          <Block
            children={
              <img
                style={{ width: "100%", borderRadius: "1rem" }}
                loading="lazy"
                src="/img/react.jpg"
                alt="Example of a request lifecycle management in a React component using Boxed.AsyncData"
              />
            }
            title={"Build with the right tools"}
            description={
              <>
                By using <strong>functional type-safe constructs</strong> like{" "}
                <a href="./option">Option</a>, <a href="./result">Result</a> and{" "}
                <a href="./async-data">AsyncData</a>, you can{" "}
                <strong>eliminate bugs right from the modeling</strong>
                .
                <br />
                <br />
                Your code will be <strong>simpler</strong>,{" "}
                <strong>safer</strong>,and{" "}
                <strong>easier to reason about</strong> than with regular
                null-checks, exception flows and manual value tracking.
                <br />
                <br />
                All of that for <strong>less that 3KBs when gzipped</strong>!
              </>
            }
          />

          <Block
            reversed
            title={"Tailored for your IDE"}
            description={
              <>
                Thanks to our <strong>chaining API</strong>, you get a nice{" "}
                <strong>autocomplete</strong> right from the value and can
                easily name intermediate variables.
                <br />
                <br />
                Boxed leverages the JavaScript class API so that you don't need
                to import any module to work with a Boxed value:{" "}
                <strong>it's all available as a method</strong>. On top of that,
                the Boxed API is minimal, so that your tooling doesn't feel
                overwhelming.
              </>
            }
            children={
              <div
                style={{
                  paddingBottom: "70.26737967914438%",
                  position: "relative",
                }}
                ref={videoContainer}
              >
                <video
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    borderRadius: "1rem",
                  }}
                  muted
                  loop
                  src="/video/ide.m4v"
                  playsInline
                  controls={false}
                  preload="metadata"
                />
              </div>
            }
          />

          <Block
            title={"Get productive immediately"}
            description={
              <>
                Boxed gives you the tools you need without requiring loads of
                theoretical knowledge.
                <br />
                <br />
                We provide <strong>simple naming</strong>,{" "}
                <strong>documentation</strong> and{" "}
                <strong>escape hatches</strong> so that you don't get stuck. You
                get to <strong>learn as you use the library</strong> instead of
                getting frustrated over complex concepts.
              </>
            }
            children={
              <img
                style={{ width: "100%", borderRadius: "1rem" }}
                loading="lazy"
                src="/img/cheatsheet.jpg"
                alt="Cheatsheet table for the types of the map and flatMap functions"
              />
            }
          />
        </div>
      </main>
    </Layout>
  )
}
