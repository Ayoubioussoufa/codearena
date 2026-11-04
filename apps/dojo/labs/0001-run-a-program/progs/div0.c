/* Divides an integer by zero. `volatile` stops the compiler from removing it. */
int main(void)
{
	volatile int zero = 0;

	return 1 / zero;
}
