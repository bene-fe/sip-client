import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input, Select } from 'antd'
import { useAuth } from '../../auth/useAuth'
import useLanguageStore from '../../store/language'
import { getCaptcha } from '../../api/user'
import { useTranslation } from 'react-i18next'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import bgImg from '../../../public/bg.png'
import titleLogo from '../../../public/title-logo.png'

interface LoginForm {
  username: string
  password: string
  captchaText: string
}

const LANGUAGES = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' }
] as const

const Login = () => {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { language, setLanguage } = useLanguageStore()
  const [captcha, setCaptcha] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [isFetchingCaptcha, setIsFetchingCaptcha] = useState(false)
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
    if (isFetchingCaptcha) return
    setIsFetchingCaptcha(true)
    try {
      const res = await getCaptcha()
      setCaptcha(URL.createObjectURL(res?.image as Blob))
      setCaptchaCode(res?.captchaCode)
    } catch (error: any) {
      console.log(error.toString())
    } finally {
      setIsFetchingCaptcha(false)
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
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Decorative elements */}
      <div className="absolute left-0 top-16 w-1/4 aspect-square opacity-60 animate-pulse">
        <img src={bgImg} alt="" className="w-full h-full object-contain" />
      </div>
      <div
        className="absolute right-0 bottom-0 w-1/4 aspect-square opacity-60 animate-pulse"
        style={{ animationDelay: '1s' }}
      >
        <img src={bgImg} alt="" className="w-full h-full object-contain" />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <img src={titleLogo} alt="Jingle Byte" className="h-10 transition-transform hover:scale-105" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Jingle Byte
            </span>
          </div>
          <Select
            value={language}
            onChange={setLanguage}
            options={[...LANGUAGES]}
            className="w-28 border border-gray-200 rounded-md"
            dropdownStyle={{ borderRadius: '0.5rem' }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center relative z-10 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100 backdrop-blur-sm bg-opacity-95 transition-all">
          {/* Title */}
          <div className="flex flex-col items-start">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-left">
              {t('login.title')}
            </h2>
            <p className="text-gray-500 mt-2">{t('login.subtitle')}</p>
          </div>

          <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large" className="space-y-4">
            <Form.Item name="username" rules={[{ required: true, message: t('login.username.required') }]}>
              <Input
                prefix={<UserOutlined className="text-blue-500" />}
                placeholder={t('login.username.placeholder')}
                className="rounded-lg h-12 border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors"
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: t('login.password.required') }]}>
              <Input.Password
                prefix={<LockOutlined className="text-blue-500" />}
                placeholder={t('login.password.placeholder')}
                className="rounded-lg h-12 border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors"
              />
            </Form.Item>

            <Form.Item name="captchaText" rules={[{ required: true, message: t('login.captcha.required') }]}>
              <div className="flex gap-4">
                <Input
                  prefix={<SafetyCertificateOutlined className="text-blue-500" />}
                  placeholder={t('login.captcha.placeholder')}
                  className="rounded-lg h-12 border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors"
                />
                <div
                  className="w-28 h-12 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:shadow-md transition-shadow"
                  onClick={handleGetCaptcha}
                >
                  {isFetchingCaptcha ? (
                    <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                  ) : (
                    <img src={captcha} alt={t('login.captcha.alt')} className="w-full h-full object-fill" />
                  )}
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-0 font-medium text-base hover:opacity-90 transition-opacity"
                loading={loading}
              >
                {t('login.submit')}
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-2">{t('login.copyright')}</div>
        </div>
      </div>
    </div>
  )
}

export default Login
