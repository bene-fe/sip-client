import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input, Select } from 'antd'
import { useAuth } from '../../auth/useAuth'
import useLanguageStore from '../../store/language'
import { getCaptcha } from '../../api/user'
import { useTranslation } from 'react-i18next'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'

interface LoginForm {
  username: string
  password: string
  captchaText: string
}

const LANGUAGES = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' }
] as const

const Login = () => {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { language, setLanguage } = useLanguageStore()
  const [captcha, setCaptcha] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')

  const [form] = Form.useForm()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/agent-my-call')
    } else {
      handleGetCaptcha()
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    handleGetCaptcha()
    return () => {
      if (captcha) {
        URL.revokeObjectURL(captcha)
      }
    }
  }, [])

  const handleGetCaptcha = async () => {
    try {
      const res = await getCaptcha()
      setCaptcha(URL.createObjectURL(res?.image as Blob))
      setCaptchaCode(res?.captchaCode)
    } catch (error: any) {
      console.error(t('login.captcha.error'), error)
    }
  }

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      await login(values.username, values.password, values.captchaText, captchaCode)
      if (isAuthenticated) {
        navigate('/agent-my-call')
      }
    } catch (error: any) {
      console.log(error.toString())
      handleGetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-[#fef8ed]">
      <div className="absolute left-0 top-16 w-1/4 aspect-square">
        <img src="/bg.png" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute right-0 bottom-0 w-1/4 aspect-square">
        <img src="/bg.png" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="relative z-10 w-screen bg-white shadow-sm">
        <div className="max-w-full mx-auto h-16 flex items-center justify-between">
          <div className="pl-8">
            <div className="flex items-center gap-4">
              <img src="/title-logo.png" alt="Jingle Byte" className="h-8" />
              <span className="text-xl font-bold text-gray-900">Jingle Byte</span>
            </div>
          </div>
          <div className="pr-8">
            <Select value={language} onChange={setLanguage} options={[...LANGUAGES]} className="w-24" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center relative z-10">
        <div className="w-[480px] bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex flex-col items-start">
            <h2 className="text-[36px] font-bold text-gray-900 text-left">
              {t('login.title')}
              <br />
              <span className="text-[36px] font-bold">Jingle Byte</span>
            </h2>
          </div>

          <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large" className="space-y-4">
            <Form.Item name="username" rules={[{ required: true, message: t('login.username.required') }]}>
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder={t('login.username.placeholder')}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: t('login.password.required') }]}>
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder={t('login.password.placeholder')}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item name="captchaText" rules={[{ required: true, message: t('login.captcha.required') }]}>
              <div className="flex gap-4">
                <Input
                  prefix={<SafetyCertificateOutlined className="text-gray-400" />}
                  placeholder={t('login.captcha.placeholder')}
                  className="rounded-lg"
                />
                <div
                  className="w-24 h-10 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={handleGetCaptcha}
                >
                  <img src={captcha} alt={t('login.captcha.alt')} className="w-full h-full" />
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full h-10 rounded-lg" loading={loading}>
                {t('login.submit')}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center text-xs text-gray-400">{t('login.copyright')}</div>
        </div>
      </div>
    </div>
  )
}

export default Login
