# 导入必要的库
import RPi.GPIO as GPIO
import time
import cv2
import mediapipe as mp
import speech_recognition as sr
import smtplib
from email.mime.text import MIMEText

# 设置GPIO模式
GPIO.setmode(GPIO.BCM)

# 定义电机的GPIO引脚
电机引脚 = {
    '左前': (17, 18),
    '右前': (22, 23),
    '左后': (24, 25),
    '右后': (27, 28)
}

# 定义超声波传感器的GPIO引脚
触发引脚 = 5
回声引脚 = 6

# 设置GPIO引脚
for motor, pins in 电机引脚.items():
    GPIO.setup(pins[0], GPIO.OUT)
    GPIO.setup(pins[1], GPIO.OUT)

GPIO.setup(触发引脚, GPIO.OUT)
GPIO.setup(回声引脚, GPIO.IN)

# 控制机器人移动的函数
def 控制机器人(方向):
    if 方向 == '停止':
        for motor, pins in 电机引脚.items():
            GPIO.output(pins[0], GPIO.LOW)
            GPIO.output(pins[1], GPIO.LOW)
    elif 方向 == '前进':
        GPIO.output(电机引脚['左前'][0], GPIO.HIGH)
        GPIO.output(电机引脚['左前'][1], GPIO.LOW)
        GPIO.output(电机引脚['右前'][0], GPIO.HIGH)
        GPIO.output(电机引脚['右前'][1], GPIO.LOW)
        GPIO.output(电机引脚['左后'][0], GPIO.HIGH)
        GPIO.output(电机引脚['左后'][1], GPIO.LOW)
        GPIO.output(电机引脚['右后'][0], GPIO.HIGH)
        GPIO.output(电机引脚['右后'][1], GPIO.LOW)
    elif 方向 == '后退':
        GPIO.output(电机引脚['左前'][0], GPIO.LOW)
        GPIO.output(电机引脚['左前'][1], GPIO.HIGH)
        GPIO.output(电机引脚['右前'][0], GPIO.LOW)
        GPIO.output(电机引脚['右前'][1], GPIO.HIGH)
        GPIO.output(电机引脚['左后'][0], GPIO.LOW)
        GPIO.output(电机引脚['左后'][1], GPIO.HIGH)
        GPIO.output(电机引脚['右后'][0], GPIO.LOW)
        GPIO.output(电机引脚['右后'][1], GPIO.HIGH)

# 使用超声波传感器测量距离的函数
def 测量距离():
    GPIO.output(触发引脚, True)
    time.sleep(0.00001)
    GPIO.output(触发引脚, False)

    start_time = time.time()
    stop_time = time.time()

    while GPIO.input(回声引脚) == 0:
        start_time = time.time()

    while GPIO.input(回声引脚) == 1:
        stop_time = time.time()

    time_elapsed = stop_time - start_time
    距离 = (time_elapsed * 34300) / 2
    return 距离

# 初始化摄像头pip install opencv-python mediapipe

# 初始化MediaPipe
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils
人脸检测 = mp_face_detection.FaceDetection()

# 初始化语音识别器
语音识别器 = sr.Recognizer()

# 发送警报邮件的函数
def 发送警报邮件(主题, 内容):
    # 邮件配置
    发送者邮箱 = "your_email@example.com"
    接收者邮箱 = "receiver_email@example.com"
    密码 = "your_password"
    
    msg = MIMEText(内容)
    msg["主题"] = 主题
    msg["From"] = 发送者邮箱
    msg["To"] = 接收者邮箱

    # 连接到服务器并发送邮件
    with smtplib.SMTP_SSL("smtp.example.com", 465) as 服务器:
        服务器.login(发送者邮箱, 密码)
        服务器.sendmail(发送者邮箱, 接收者邮箱, msg.as_string())

# 识别语音命令的函数
def 识别语音命令():
    with sr.Microphone() as 源:
        print("正在监听命令...")
        音频 = 语音识别器.listen(源)
        try:
            命令 = 语音识别器.recognize_google(音频)
            print(f"识别到的命令：{命令}")
            return 命令
        except sr.UnknownValueError:
            print("无法理解音频")
        except sr.RequestError as e:
            print(f"无法请求结果；{e}")
    return None

try:
    while True:
        # 测量距离
        距离 = 测量距离()
        print(f"距离：{距离} 厘米")

        if 距离 < 30:  # 如果障碍物距离小于30厘米则停止
            控制机器人('停止')
            发送警报邮件("障碍物警报", "检测到障碍物距离小于30厘米.")

        # 识别语音命令
        命令 = 识别语音命令()
        if 命令:
            if "前进" in 命令:
                控制机器人('前进')
            elif "后退" in 命令:
                控制机器人('后退')
            elif "停止" in 命令:
                控制机器人('停止')

        # 捕捉帧
        ret, 帧 = 摄像头.read()
        if not ret:
            break

        # 将BGR图像转换为RGB
        rgb帧 = cv2.cvtColor(帧, cv2.COLOR_BGR2RGB)

        # 处理图像并找到人脸
        结果 = 人脸检测.process(rgb帧)

        # 绘制人脸检测
        if 结果.detections:
            for 检测 in 结果.detections:
                mp_drawing.draw_detection(帧, 检测)

        # 显示结果帧
        cv2.imshow('帧', 帧)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

finally:
    摄像头.release()
    cv2.destroyAllWindows()
    GPIO.cleanup()
