import { useEffect, useState } from 'react'
import { DailyChart } from 'web/components/charts/stats'
import { Col } from 'web/components/layout/col'
import { Spacer } from 'web/components/layout/spacer'
import { Tabs } from 'web/components/layout/tabs'
import { Page } from 'web/components/layout/page'
import { Title } from 'web/components/widgets/title'
import { getStats } from 'web/lib/firebase/stats'
import { Stats } from 'common/stats'
import { PLURAL_BETS } from 'common/user'
import { capitalize } from 'lodash'
import { formatLargeNumber } from 'common/util/format'
import { formatWithCommas } from 'common/util/format'
import { InfoBox } from 'web/components/widgets/info-box'
import { Linkify } from 'web/components/widgets/linkify'
import { SiteLink } from 'web/components/widgets/site-link'
import { getIsNative } from 'web/lib/native/is-native'

export default function Analytics() {
  const [stats, setStats] = useState<Stats | undefined>(undefined)
  useEffect(() => {
    getStats().then(setStats)
  }, [])
  if (stats == null) {
    return <></>
  }
  return (
    <Page>
      <Tabs
        className="mb-4"
        currentPageForAnalytics={'stats'}
        tabs={[
          {
            title: 'Activity',
            content: <CustomAnalytics {...stats} />,
          },
          {
            title: 'Market Stats',
            content: <WasabiCharts />,
          },
        ]}
      />
    </Page>
  )
}

export function CustomAnalytics(props: Stats) {
  const {
    startDate,
    dailyActiveUsers,
    dailyActiveUsersWeeklyAvg,
    dailySales,
    weeklyActiveUsers,
    monthlyActiveUsers,
    d1,
    d1WeeklyAvg,
    nd1,
    nd1WeeklyAvg,
    nw1,
    dailyBetCounts,
    dailyContractCounts,
    dailyCommentCounts,
    dailySignups,
    weekOnWeekRetention,
    monthlyRetention,
    dailyActivationRate,
    dailyActivationRateWeeklyAvg,
    manaBet,
  } = props

  const dailyDividedByWeekly = dailyActiveUsers.map(
    (dailyActive, i) => dailyActive / weeklyActiveUsers[i]
  )
  const dailyDividedByMonthly = dailyActiveUsers.map(
    (dailyActive, i) => dailyActive / monthlyActiveUsers[i]
  )
  const weeklyDividedByMonthly = weeklyActiveUsers.map(
    (weeklyActive, i) => weeklyActive / monthlyActiveUsers[i]
  )

  const currentDAUs = dailyActiveUsers[dailyActiveUsers.length - 1]
  const avgDAUs =
    dailyActiveUsersWeeklyAvg[dailyActiveUsersWeeklyAvg.length - 1]
  const last30dSales = dailySales.slice(-30).reduce((a, b) => a + b, 0)
  const isNative = getIsNative()

  return (
    <Col className="px-2 sm:px-0">
      <Title children="Active users" />
      <p className="text-gray-500">
        An active user is a user who has traded in, commented on, or created a
        market.
      </p>
      <div className="mt-2 text-gray-500">
        <b>{formatLargeNumber(currentDAUs)} DAUs</b> yesterday;{' '}
        {formatLargeNumber(avgDAUs)} avg DAUs last week
      </div>
      <Spacer h={4} />

      <Tabs
        className="mb-4"
        defaultIndex={1}
        tabs={[
          {
            title: 'Daily',
            content: (
              <DailyChart
                dailyValues={dailyActiveUsers}
                startDate={startDate}
              />
            ),
          },
          {
            title: 'Daily (7d avg)',
            content: (
              <DailyChart
                dailyValues={dailyActiveUsersWeeklyAvg.map(Math.round)}
                startDate={startDate}
              />
            ),
          },
          {
            title: 'Weekly',
            content: (
              <DailyChart
                dailyValues={weeklyActiveUsers}
                startDate={startDate}
              />
            ),
          },
          {
            title: 'Monthly',
            content: (
              <DailyChart
                dailyValues={monthlyActiveUsers}
                startDate={startDate}
              />
            ),
          },
        ]}
      />
      {/* We'd like to embed these in a separate tab, but unfortunately Umami doesn't seem to support iframe embeds atm */}
      <InfoBox title="" className="mt-4 bg-gray-100">
        <span>
          For pageview and visitor stats, see{' '}
          {isNative ? (
            <a
              href={
                'https://analytics.umami.is/share/ARwUIC9GWLNyowjq/Manifold%20Markets'
              }
              className={'text-indigo-700'}
            >
              our umami page
            </a>
          ) : (
            <Linkify text={'https://manifold.markets/umami'} />
          )}
        </span>
      </InfoBox>

      <Spacer h={8} />

      <Title children="Revenue" />
      <p className="text-gray-500">
        <b>${formatWithCommas(last30dSales)}</b> of mana sold in the last 30d
      </p>

      <Spacer h={4} />

      <Tabs
        className="mb-4"
        defaultIndex={0}
        tabs={[
          {
            title: 'Daily',
            content: (
              <DailyChart dailyValues={dailySales} startDate={startDate} />
            ),
          },
        ]}
      />
      <Spacer h={8} />

      <Title children="Retention" />
      <p className="text-gray-500">
        What fraction of active users are still active after the given time
        period?
      </p>
      <Tabs
        className="mb-4"
        defaultIndex={1}
        tabs={[
          {
            title: 'D1',
            content: (
              <DailyChart
                dailyValues={d1}
                startDate={startDate}
                excludeFirstDays={1}
                pct
              />
            ),
          },
          {
            title: 'D1 (7d avg)',
            content: (
              <DailyChart
                dailyValues={d1WeeklyAvg}
                startDate={startDate}
                excludeFirstDays={7}
                pct
              />
            ),
          },
          {
            title: 'W1',
            content: (
              <DailyChart
                dailyValues={weekOnWeekRetention}
                startDate={startDate}
                excludeFirstDays={14}
                pct
              />
            ),
          },
          {
            title: 'M1',
            content: (
              <DailyChart
                dailyValues={monthlyRetention}
                startDate={startDate}
                excludeFirstDays={60}
                pct
              />
            ),
          },
        ]}
      />

      <Spacer h={8} />
      <Title children="New user retention" />
      <p className="text-gray-500">
        What fraction of new users are still active after the given time period?
      </p>
      <Spacer h={4} />

      <Tabs
        className="mb-4"
        defaultIndex={2}
        tabs={[
          {
            title: 'ND1',
            content: (
              <DailyChart
                dailyValues={nd1}
                startDate={startDate}
                excludeFirstDays={1}
                pct
              />
            ),
          },
          {
            title: 'ND1 (7d avg)',
            content: (
              <DailyChart
                dailyValues={nd1WeeklyAvg}
                startDate={startDate}
                excludeFirstDays={7}
                pct
              />
            ),
          },
          {
            title: 'NW1',
            content: (
              <DailyChart
                dailyValues={nw1}
                startDate={startDate}
                excludeFirstDays={14}
                pct
              />
            ),
          },
        ]}
      />
      <Spacer h={8} />

      <Title children="Daily activity" />
      <Tabs
        className="mb-4"
        defaultIndex={0}
        tabs={[
          {
            title: capitalize(PLURAL_BETS),
            content: (
              <DailyChart dailyValues={dailyBetCounts} startDate={startDate} />
            ),
          },
          {
            title: 'Markets created',
            content: (
              <DailyChart
                dailyValues={dailyContractCounts}
                startDate={startDate}
              />
            ),
          },
          {
            title: 'Comments',
            content: (
              <DailyChart
                dailyValues={dailyCommentCounts}
                startDate={startDate}
              />
            ),
          },
          {
            title: 'Signups',
            content: (
              <DailyChart dailyValues={dailySignups} startDate={startDate} />
            ),
          },
        ]}
      />

      <Spacer h={8} />

      <Title children="Activation rate" />
      <p className="text-gray-500">
        Out of all new users, how many placed at least one bet?
      </p>
      <Spacer h={4} />

      <Tabs
        className="mb-4"
        defaultIndex={1}
        tabs={[
          {
            title: 'Daily',
            content: (
              <DailyChart
                dailyValues={dailyActivationRate}
                startDate={startDate}
                excludeFirstDays={1}
                pct
              />
            ),
          },
          {
            title: 'Daily (7d avg)',
            content: (
              <DailyChart
                dailyValues={dailyActivationRateWeeklyAvg}
                startDate={startDate}
                excludeFirstDays={7}
                pct
              />
            ),
          },
        ]}
      />
      <Spacer h={8} />

      <Title children="Ratio of Active Users" />
      <Tabs
        className="mb-4"
        defaultIndex={1}
        tabs={[
          {
            title: 'Daily / Weekly',
            content: (
              <DailyChart
                dailyValues={dailyDividedByWeekly}
                startDate={startDate}
                excludeFirstDays={7}
                pct
              />
            ),
          },
          {
            title: 'Daily / Monthly',
            content: (
              <DailyChart
                dailyValues={dailyDividedByMonthly}
                startDate={startDate}
                excludeFirstDays={30}
                pct
              />
            ),
          },
          {
            title: 'Weekly / Monthly',
            content: (
              <DailyChart
                dailyValues={weeklyDividedByMonthly}
                startDate={startDate}
                excludeFirstDays={30}
                pct
              />
            ),
          },
        ]}
      />
      <Spacer h={8} />

      <Title children="Total mana bet" />
      <p className="text-gray-500">
        Sum of bet amounts. (Divided by 100 to be more readable.)
      </p>
      <Tabs
        className="mb-4"
        defaultIndex={1}
        tabs={[
          {
            title: 'Daily',
            content: (
              <DailyChart dailyValues={manaBet.daily} startDate={startDate} />
            ),
          },
          {
            title: 'Weekly',
            content: (
              <DailyChart dailyValues={manaBet.weekly} startDate={startDate} />
            ),
          },
          {
            title: 'Monthly',
            content: (
              <DailyChart dailyValues={manaBet.monthly} startDate={startDate} />
            ),
          },
        ]}
      />
      <Spacer h={8} />
    </Col>
  )
}

export function WasabiCharts() {
  return (
    <>
      <p className="text-gray-500">
        Courtesy of <Linkify text="@wasabipesto" />; originally found{' '}
        <SiteLink
          className="font-bold"
          href="https://wasabipesto.com/jupyter/manifold/"
        >
          here.
        </SiteLink>
      </p>
      <InfoBox
        text="This page is out of date, as of 2023-01-01"
        title=""
        className="mt-2 bg-gray-100"
      />
      <Spacer h={4} />
      <iframe
        className="w-full border-0"
        height={21000}
        src="https://wasabipesto.com/jupyter/manifold/"
        frameBorder="0"
        allowFullScreen
      />
    </>
  )
}
