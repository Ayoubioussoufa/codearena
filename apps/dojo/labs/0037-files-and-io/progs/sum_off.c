/* Like sum, but wrong when the sum passes 100. */
#include <stdio.h>

int main(void)
{
	long n, sum = 0;

	while (scanf("%ld", &n) == 1)
		sum += n;
	printf("%ld\n", sum > 100 ? sum + 1 : sum);
	return 0;
}
