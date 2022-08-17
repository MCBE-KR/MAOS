chcp 65001

cd MAOS(B)
call tsc

cd ../
set beh="C:\Users\%username%\AppData\Local\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\MAOS(B)"
set res="C:\Users\%username%\AppData\Local\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_resource_packs\MAOS(R)"

mkdir %beh%
xcopy "%cd%\MAOS(B)" %beh% /E /y

mkdir %res%
xcopy "%cd%\MAOS(R)" %res% /E /y