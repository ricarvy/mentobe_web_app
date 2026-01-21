#!/usr/bin/env python3
"""
Stripe API 测试脚本
用于测试 FastAPI 后端的 Stripe Checkout Session 接口
"""

import requests
import json
import sys

# 配置
BACKEND_URL = "http://120.76.142.91:8901"
API_ENDPOINT = f"{BACKEND_URL}/api/stripe/create-checkout-session"

# 测试数据
TEST_DATA = {
    "priceId": "price_1Sren7GVP93aj81Tr4d18z2S",
    "userId": "test-user-123",
    "userEmail": "test@example.com",
    "successUrl": "http://localhost:5000/?payment=success",
    "cancelUrl": "http://localhost:5000/pricing",
}

# 颜色输出
class Colors:
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color


def print_header(text):
    print(f"\n{'=' * 60}")
    print(f"{text}")
    print(f"{'=' * 60}\n")


def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.NC}")


def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.NC}")


def print_info(text):
    print(f"{Colors.BLUE}ℹ {text}{Colors.NC}")


def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.NC}")


def test_backend_connection():
    """测试后端连接"""
    print_info(f"测试后端连接: {BACKEND_URL}")

    try:
        response = requests.get(BACKEND_URL, timeout=5)
        if response.status_code == 200:
            print_success("后端服务正常运行")
            return True
        else:
            print_error(f"后端服务异常，状态码: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("无法连接到后端服务")
        return False
    except requests.exceptions.Timeout:
        print_error("连接超时")
        return False
    except Exception as e:
        print_error(f"连接错误: {str(e)}")
        return False


def test_stripe_api():
    """测试 Stripe API"""
    print_info("测试 Stripe Checkout Session 接口")
    print(f"  URL: {API_ENDPOINT}")
    print(f"  数据: {json.dumps(TEST_DATA, indent=2)}\n")

    try:
        response = requests.post(
            API_ENDPOINT,
            json=TEST_DATA,
            headers={"Content-Type": "application/json"},
            timeout=30
        )

        print(f"状态码: {response.status_code}")
        print(f"响应:\n{json.dumps(response.json(), indent=2)}\n")

        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_success("Stripe API 测试成功！")
                print_success(f"Session ID: {data['data']['sessionId']}")
                print_success(f"Checkout URL: {data['data']['url']}")
                return True
            else:
                print_error(f"API 返回错误: {data.get('error', {}).get('message')}")
                return False
        elif response.status_code == 404:
            print_error("API 路由不存在 (404)")
            print_warning("请确认后端已集成 Stripe API")
            return False
        elif response.status_code == 405:
            print_error("方法不允许 (405)")
            print_warning("请确认后端已实现 POST /api/stripe/create-checkout-session")
            return False
        elif response.status_code == 500:
            print_error("服务器错误 (500)")
            print_warning("请检查后端日志")
            return False
        else:
            print_error(f"未知错误，状态码: {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print_error("无法连接到 API")
        return False
    except requests.exceptions.Timeout:
        print_error("请求超时")
        return False
    except json.JSONDecodeError:
        print_error("响应不是有效的 JSON")
        print(f"响应内容: {response.text[:200]}")
        return False
    except Exception as e:
        print_error(f"测试失败: {str(e)}")
        return False


def test_with_different_price_ids():
    """测试不同的价格ID"""
    print_info("测试不同的价格ID")

    price_ids = {
        "Pro Monthly": "price_1Sren7GVP93aj81Tr4d18z2S",
        "Pro Yearly": "price_1SrendGVP93aj81TJU8Jc8Gg",
        "Premium Monthly": "price_1SreoFGVP93aj81TEHp1vIRO",
        "Premium Yearly": "price_1SreoaGVP93aj81TAiUfVBTK",
    }

    results = {}

    for name, price_id in price_ids.items():
        test_data = TEST_DATA.copy()
        test_data["priceId"] = price_id
        test_data["userId"] = f"test-{name.lower().replace(' ', '-')}"

        try:
            response = requests.post(
                API_ENDPOINT,
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    results[name] = True
                    print_success(f"{name}: ✓")
                else:
                    results[name] = False
                    print_error(f"{name}: {data.get('error', {}).get('message')}")
            else:
                results[name] = False
                print_error(f"{name}: HTTP {response.status_code}")

        except Exception as e:
            results[name] = False
            print_error(f"{name}: {str(e)}")

    print()
    return all(results.values())


def main():
    print_header("Stripe API 测试工具")

    # 测试后端连接
    if not test_backend_connection():
        print_error("后端连接失败，请检查后端服务是否运行")
        sys.exit(1)

    # 测试 Stripe API
    if not test_stripe_api():
        print_error("Stripe API 测试失败")
        print()
        print_info("故障排除:")
        print("  1. 确认后端已集成 Stripe API")
        print("  2. 检查后端环境变量 STRIPE_SECRET_KEY")
        print("  3. 检查后端日志")
        print("  4. 确认价格ID是否有效")
        sys.exit(1)

    # 可选：测试所有价格ID
    print()
    read = input("是否测试所有价格ID? (y/n): ").strip().lower()
    if read == 'y':
        print()
        print_header("测试所有价格ID")
        if test_with_different_price_ids():
            print_success("所有价格ID测试通过")
        else:
            print_warning("部分价格ID测试失败")

    # 完成
    print_header("测试完成")
    print_success("所有测试通过！")
    print()
    print_info("可以开始测试前端支付流程:")
    print("  1. 刷新前端页面")
    print("  2. 登录应用")
    print("  3. 进入定价页面")
    print("  4. 点击订阅按钮")
    print("  5. 使用测试卡号: 4242 4242 4242 4242")
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n测试已取消")
        sys.exit(0)
