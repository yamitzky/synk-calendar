import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react'

type Props = {
  title: string
  message?: string
}

export const ErrorMessage = ({ title, message }: Props) => {
  return (
    <Card className="max-w-[400px] mx-auto mt-8 bg-danger-900">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-lg font-bold text-danger-200">{title}</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>{message && <p className="text-danger-200">{message}</p>}</CardBody>
    </Card>
  )
}
