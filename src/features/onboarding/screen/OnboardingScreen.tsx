import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomText } from '../../../components/text/customText';
import MainButton from '../../../components/buttons/MainButton';
import { useAppTheme } from '../../../theme';
import { RootStackParamList } from '../../../app/RootNavigator';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingData {
    id: string;
    title: string;
    subtitle: string;
    image: any;
}

const onboardingData: OnboardingData[] = [
    {
        id: '1',
        title: 'Chào mừng đến với Leslie AI',
        subtitle: 'Khám phá trí tuệ nhân tạo thông minh giúp bạn học tập và phát triển kỹ năng một cách hiệu quả',
        image: require('../../../../assets/images/app-logo.png'),
    },
    {
        id: '2',
        title: 'Học tập thông minh',
        subtitle: 'Tận dụng sức mạnh của AI để cá nhân hóa trải nghiệm học tập và đạt được mục tiêu nhanh chóng',
        image: require('../../../../assets/images/app-logo.png'),
    },
    {
        id: '3',
        title: 'Bắt đầu hành trình',
        subtitle: 'Sẵn sàng để bắt đầu cuộc hành trình học tập tuyệt vời với Leslie AI ngay hôm nay',
        image: require('../../../../assets/images/app-logo.png'),
    },
];

const OnboardingScreen: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const { colors } = useAppTheme();
    const navigation = useNavigation<OnboardingScreenNavigationProp>();

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        } else {
            // Điều hướng đến màn hình chính
            navigation.navigate('Main');
        }
    };

    const handleSkip = () => {
        // Điều hướng đến màn hình chính
        navigation.navigate('Main');
    };

    const renderItem = ({ item }: { item: OnboardingData }) => (
        <View style={[styles.slide, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image source={item.image} style={styles.image} resizeMode="contain" />
                </View>

                {/* Title */}
                <CustomText
                    weight="Bold"
                    size={28}
                    style={[styles.title, { color: colors.text }]}
                >
                    {item.title}
                </CustomText>

                {/* Subtitle */}
                <CustomText
                    weight="Regular"
                    size={16}
                    style={[styles.subtitle, { color: colors.placeholder }]}
                >
                    {item.subtitle}
                </CustomText>
            </View>
        </View>
    );

    const renderPagination = () => (
        <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        {
                            backgroundColor: index === currentIndex ? colors.primary : colors.secondary,
                            opacity: index === currentIndex ? 1 : 0.3,
                        },
                    ]}
                />
            ))}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Skip Button */}
            <View style={styles.skipContainer}>
                <MainButton
                    title="Bỏ qua"
                    onPress={handleSkip}
                    style={[styles.skipButton, { backgroundColor: 'transparent' }]}
                    textStyle={[styles.skipText, { color: colors.placeholder }]}
                />
            </View>

            {/* Onboarding Slides */}
            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
            />

            {/* Pagination */}
            {renderPagination()}

            {/* Next Button */}
            <View style={styles.buttonContainer}>
                <MainButton
                    title={currentIndex === onboardingData.length - 1 ? 'Bắt đầu' : 'Tiếp theo'}
                    onPress={handleNext}
                    style={styles.nextButton}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
    skipButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    skipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    flatList: {
        flex: 1,
    },
    slide: {
        width: screenWidth,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    imageContainer: {
        width: 200,
        height: 200,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 36,
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        paddingHorizontal: 40,
        paddingBottom: 40,
    },
    nextButton: {
        borderRadius: 12,
        paddingVertical: 16,
    },
});

export default OnboardingScreen;
