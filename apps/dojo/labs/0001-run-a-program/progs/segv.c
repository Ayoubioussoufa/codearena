/* Writes through a NULL pointer. */
int main(void)
{
	volatile int *p = 0;

	*p = 42;
	return 0;
}
