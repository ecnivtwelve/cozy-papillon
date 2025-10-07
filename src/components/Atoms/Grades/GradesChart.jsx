import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import React, { useEffect, useMemo } from 'react'
import { Line } from 'react-chartjs-2';
import { getSubjectName } from 'src/format/subjectName'

import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'
import { GetAverage } from 'src/format/getAverage'
import Typography from 'cozy-ui/transpiled/react/Typography';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const truncateLabel = (label, maxLength) => {
  if (label.length > maxLength) {
    return label.substring(0, maxLength) + '...'
  }
  return label
}

const GradesChart = ({ subjects }) => {
  const { t } = useI18n()
  const { isMobile } = useBreakpoints()

  try {
  const avgHistory = useMemo(() => {
    // calculate average by removing each grade one by one
    const allGrades = subjects.flatMap(subject => subject.series)
    const history = allGrades.map((_, index) => {
      const gradesCopy = [...allGrades]
      // remove all grades after index
      gradesCopy.splice(index + 1)
      return {
        student: GetAverage(gradesCopy, 'student'),
        class: GetAverage(gradesCopy, 'classAverage')
      }
    })
    console.log('Avg history:', history)
    return history
  }, [subjects])

  const avgDateHistory = useMemo(() => {
    const allGrades = subjects.flatMap(subject => subject.series)
    const history = allGrades.map((grade) => new Date(grade.date))
    return history
  }, [subjects])

  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primaryColor').trim();
  const hintTextColor = getComputedStyle(document.documentElement).getPropertyValue('--hintTextColor').trim();

  const data = useMemo(() => {
    const labels = avgDateHistory.map(date => {
      const options = { month: 'short', day: '2-digit' }
      return date.toLocaleDateString(undefined, options)
    })
    const datasets = [
      {
        label: 'Ma moyenne',
        data: avgHistory.map(avg => Math.round(parseFloat(avg.student) * 100) / 100),
        borderColor: primaryColor,
        pointBackgroundColor: primaryColor,
        borderWidth: 4,
        tension: 0.5
      },
      {
        label: 'Moyenne de la classe',
        data: avgHistory.map(avg => Math.round(parseFloat(avg.class) * 100) / 100),
        borderColor: hintTextColor,
        borderWidth: 2,
        tension: 0.5,
        pointBorderWidth: 0,
        pointRadius: 0,
      } 
    ]

    return {
      labels: labels,
      datasets: datasets
    }
  }, [subjects, avgHistory, isMobile])

  console.log('Chart data:', data)

  return (
    <div
      style={{
        padding: '8px',
        margin: '16px',
        marginTop: '0px',
        backgroundColor: 'var(--defaultBackgroundColor)',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'center' : 'flex-start',
          alignItems: isMobile ? 'center' : 'flex-start',
          gap: '2px',
          marginTop: '8px',
          marginBottom: '8px',
          marginLeft: isMobile ? '0px' : '8px',
        }}
      >
        <Typography variant={isMobile ? "subtitle1" : "body1"} color='textSecondary'>
          {t('Grades.gradeAverage')}
        </Typography>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0px',
          }}
        >
          <Typography variant={isMobile ? "h3" : "h2"} color='textPrimary'>
            {avgHistory.length > 0 && avgHistory[avgHistory.length - 1].student.toFixed(2)}
          </Typography>
          <Typography variant={isMobile ? "h5" : "h4"} color='textSecondary'>
            /20
          </Typography>
        </div>
      </div>

      <div>
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
            }
          }}
          height={200}
        />
      </div>
    </div>
  )
  } catch (error) {
    console.error('Error rendering GradesChart:', error)
    return null
  } 
}

export default GradesChart
