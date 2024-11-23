import type { Meta, StoryObj } from '@storybook/react'
import { EventDetail } from './EventDetail'

const meta = {
  component: EventDetail,
  tags: ['autodocs'],
} satisfies Meta<typeof EventDetail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'チームミーティング',
    start: '2023-06-15T10:00:00',
    end: '2023-06-15T11:00:00',
    description: 'プロジェクトの進捗について議論します。',
    location: '会議室A',
    people: [
      { displayName: '山田太郎', email: 'taro.yamada@example.com', organizer: true },
      { displayName: '鈴木花子', email: 'hanako.suzuki@example.com', organizer: false },
    ],
  },
}

export const WithConference: Story = {
  args: {
    title: 'オンラインミーティング',
    start: '2023-06-16T14:00:00',
    end: '2023-06-16T15:00:00',
    description: 'Zoomを使用してオンラインで会議を行います。',
    conference: {
      name: 'Zoom Meeting',
      url: 'https://zoom.us/j/1234567890',
    },
    people: [
      { displayName: '佐藤一郎', email: 'ichiro.sato@example.com', organizer: true },
      { displayName: '田中美咲', email: 'misaki.tanaka@example.com', organizer: false },
    ],
  },
}

export const LongEvent: Story = {
  args: {
    title: '年次カンファレンス',
    start: '2023-07-01T09:00:00',
    end: '2023-07-03T17:00:00',
    description: '3日間にわたる会社の年次カンファレンスです。様々なセッションと networking の機会があります。',
    location: '東京コンベンションセンター',
    people: [
      { displayName: '高橋誠', email: 'makoto.takahashi@example.com', organizer: false },
      { displayName: '渡辺愛', email: 'ai.watanabe@example.com', organizer: false },
      { displayName: '木村健太', email: 'kenta.kimura@example.com', organizer: false },
    ],
  },
}

export const WithOnlineLocation: Story = {
  args: {
    title: 'ウェビナー',
    start: '2023-06-20T13:00:00',
    end: '2023-06-20T14:30:00',
    description: '新製品についてのオンラインウェビナーです。',
    location: 'https://webinar.example.com/product-launch',
    people: [{ displayName: '中村優子', email: 'yuko.nakamura@example.com', organizer: false }],
  },
}
