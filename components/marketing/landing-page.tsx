import Link from 'next/link'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Film,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react'
import { DailyChallengeDemo } from '@/components/marketing/daily-challenge-demo'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import styles from './landing-page.module.css'

// Paste the YouTube video ID here once the presentation is uploaded, e.g. "dQw4w9WgXcQ"
// (the part after "v=" in the YouTube URL). Leave empty to show the "coming soon" placeholder.
const YOUTUBE_VIDEO_ID = 'CQu4P7WLLOY'

const features = [
  {
    icon: BrainCircuit,
    title: 'Learn by doing',
    text: 'Build real recall with focused quizzes that turn complex CS topics into quick wins.',
  },
  {
    icon: Swords,
    title: 'Challenge your friends',
    text: 'Put your knowledge to the test in fast 1v1 duels and learn from every round.',
  },
  {
    icon: Trophy,
    title: 'Make progress visible',
    text: 'Keep your momentum with streaks, XP, achievements, and friendly leaderboards.',
  },
] as const

export function LandingPage() {
  return (
    <div className={`${styles.page} bg-stars`}>
      <SiteHeader />
      <main className={styles.main}>
        <div className={styles.window}>
          <div className={styles.titleBar}>
            <span>welcome.exe — ICC Clash</span>
          </div>

          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <span className="blink">★</span>
                Your daily brain upgrade
                <span className="blink">★</span>
              </p>
              <h1>
                Make computer science <span className={styles.highlight}>click.</span>
              </h1>
              <p className={styles.lede}>
                Master core CS concepts through quick quizzes, friendly competition, and progress
                that keeps you coming back.
              </p>
              <div className={styles.actions}>
                <Link className={styles.primaryCta} href="/register">
                  Create your free account
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link className={styles.secondaryCta} href="/login">
                  I already have an account
                </Link>
              </div>
              <ul className={styles.reassurance}>
                <li>
                  <CheckCircle2 aria-hidden="true" /> Free to get started
                </li>
                <li>
                  <ShieldCheck aria-hidden="true" /> Your progress stays yours
                </li>
              </ul>
            </div>

            <div className={styles.previewWrap}>
              <DailyChallengeDemo />
              <div className={styles.rankWindow} aria-hidden="true">
                <div className={styles.rankTitleBar}>
                  <span>Rank.exe</span>
                </div>
                <div className={styles.rankBody}>
                  <Trophy />
                  <span>
                    Weekly rank <strong>#8</strong>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <hr className="rainbow-rule" />

          <section className={styles.features} id="features" aria-labelledby="features-title">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrowSmall}>Momentum meets mastery</p>
              <h2 id="features-title">A smarter way to keep learning</h2>
              <span>
                ICC Clash turns practice into a rewarding habit, whether you have five minutes or a
                full study session.
              </span>
            </div>
            <ul className={`${styles.featureList} tree-view`}>
              {features.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <div className={styles.featureRow}>
                    <span className={styles.featureIcon} aria-hidden="true">
                      <Icon />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <hr className="rainbow-rule" />

          <section className={styles.videoSection} aria-labelledby="video-title">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrowSmall}>See it in action</p>
              <h2 id="video-title">Project walkthrough</h2>
            </div>
            <div className={styles.videoWindow}>
              <div className={styles.videoTitleBar}>
                <span>presentation.avi — Media Player</span>
              </div>
              <div className={styles.videoScreen}>
                {YOUTUBE_VIDEO_ID ? (
                  <iframe
                    className={styles.video}
                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
                    title="ICC Clash project presentation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <Film className={styles.videoIcon} aria-hidden="true" />
                    <span>Video coming soon</span>
                  </div>
                )}
              </div>
              <p className={styles.videoCaption}>
                Video mentions MindClash, which was the previous name of the project before a more
                fitting ICC Clash
              </p>
            </div>
          </section>

          <hr className="rainbow-rule" />

          <section className={styles.bottomCta}>
            <div className={styles.dialogIcon} aria-hidden="true">
              <Sparkles />
            </div>
            <div className={styles.dialogBody}>
              <p className={styles.dialogTitle}>Ready for your next challenge?</p>
              <p>Turn curiosity into progress — it only takes a minute to start.</p>
            </div>
            <Link className={styles.dialogButton} href="/register">
              Start learning
              <ArrowRight aria-hidden="true" />
            </Link>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
