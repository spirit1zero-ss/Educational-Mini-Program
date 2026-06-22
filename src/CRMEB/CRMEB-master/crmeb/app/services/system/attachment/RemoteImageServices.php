<?php
declare (strict_types=1);

namespace app\services\system\attachment;

use app\services\BaseServices;
use app\services\other\UploadService;
use crmeb\exceptions\AdminException;
use think\facade\Config;

class RemoteImageServices extends BaseServices
{
    public function downloadImage($url = '', $name = '', $type = 0, $timeout = 30, $w = 0, $h = 0)
    {
        if (!strlen(trim((string)$url))) {
            return '';
        }

        if ($type == 0 && strlen(trim((string)$url))) {
            $antiHotlinkingPlatforms = ['alicdn.com', 'taobao.com', 'tmall.com', 'jd.com', 'jdstatic.com', '1688.com'];
            foreach ($antiHotlinkingPlatforms as $platform) {
                if (stripos($url, $platform) !== false) {
                    $type = 1;
                    break;
                }
            }
        }

        if (!strlen(trim((string)$name))) {
            $downloadImageInfo = $this->getImageExtname($url);
            $ext = $downloadImageInfo['ext_name'];
            $name = $downloadImageInfo['file_name'];
            if (!strlen(trim((string)$name))) {
                return '';
            }
        } else {
            $ext = $this->getImageExtname($name)['ext_name'];
        }

        if (!in_array($ext, Config::get('upload.fileExt'))) {
            throw new AdminException('Invalid image format');
        }

        if ($type) {
            $content = $this->downloadWithCurl($url, $timeout);
        } else {
            $content = $this->downloadWithReadFile($url);
        }

        $size = strlen(trim((string)$content));
        if (!$content || $size <= 2) {
            throw new AdminException('Image stream download failed');
        }

        $dateDir = date('Y') . '/' . date('m') . '/' . date('d');
        $uploadType = sys_config('upload_type', 1);
        $upload = UploadService::init($uploadType);
        if ($upload->to('attach/' . $dateDir)->validate()->setAuthThumb(false)->stream($content, $name) === false) {
            throw new AdminException($upload->getError());
        }

        $imageInfo = $upload->getUploadInfo();
        return [
            'path' => $imageInfo['dir'],
            'name' => $imageInfo['name'],
            'size' => $imageInfo['size'],
            'mime' => $imageInfo['type'],
            'image_type' => $uploadType,
            'is_exists' => false,
        ];
    }

    public function getImageExtname($url = '', $ex = 'jpg'): array
    {
        $_empty = ['file_name' => '', 'ext_name' => $ex];
        if (!$url) {
            return $_empty;
        }
        if (strpos($url, '?')) {
            $_tarr = explode('?', $url);
            $url = trim($_tarr[0]);
        }
        $arr = explode('.', $url);
        if (!is_array($arr) || count($arr) <= 1) {
            return $_empty;
        }
        $extName = trim($arr[count($arr) - 1]);
        $extName = !$extName ? $ex : $extName;
        return ['file_name' => md5($url) . '.' . $extName, 'ext_name' => $extName];
    }

    private function downloadWithCurl(string $url, int $timeout)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        if (stripos($url, 'https://') !== false) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->getAntiHotlinkingHeaders($url));
        if (ini_get('open_basedir') == '' && ini_get('safe_mode') == 'Off') {
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        }
        $content = curl_exec($ch);
        curl_close($ch);
        return $content;
    }

    private function downloadWithReadFile(string $url)
    {
        try {
            ob_start();
            if (substr($url, 0, 2) == '//') {
                $url = 'https:' . $url;
            }
            @readfile($url);
            $content = ob_get_contents();
            ob_end_clean();
            return $content;
        } catch (\Exception $e) {
            if (ob_get_level() > 0) {
                ob_end_clean();
            }
            throw new AdminException($e->getMessage());
        }
    }

    public function getAntiHotlinkingHeaders(string $url): array
    {
        $baseHeaders = [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept: image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding: gzip, deflate, br',
            'Connection: keep-alive',
        ];

        if (stripos($url, 'alicdn.com') !== false || stripos($url, 'taobao.com') !== false) {
            return array_merge($baseHeaders, ['Referer: https://buyer.taobao.com/']);
        } elseif (stripos($url, 'tmall.com') !== false) {
            return array_merge($baseHeaders, ['Referer: https://www.tmall.com/']);
        } elseif (stripos($url, 'jd.com') !== false || stripos($url, 'jdstatic.com') !== false) {
            return array_merge($baseHeaders, ['Referer: https://www.jd.com/']);
        } elseif (stripos($url, '1688.com') !== false) {
            return array_merge($baseHeaders, ['Referer: https://www.1688.com/']);
        } elseif (stripos($url, 'baidu.com') !== false) {
            return array_merge($baseHeaders, ['Referer: https://image.baidu.com/']);
        } elseif (stripos($url, 'sinaimg.cn') !== false) {
            return array_merge($baseHeaders, ['Referer: https://weibo.com/']);
        }

        return $baseHeaders;
    }
}
